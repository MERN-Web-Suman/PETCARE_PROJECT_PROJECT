import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Appointment from "../models/Appointment.js";
import Adoption from "../models/Adoption.js";

export const getProviderStats = async (req, res) => {
  try {
    const vetId = req.user?.id || req.user?._id;

    const totalAppointments = await Appointment.countDocuments({ vet: vetId });
    const pending = await Appointment.countDocuments({ vet: vetId, status: 'pending' });
    const confirmed = await Appointment.countDocuments({ vet: vetId, status: 'confirmed' });
    const adoptions = await Adoption.countDocuments();
    const inventoryCount = await Product.countDocuments({ provider: vetId });

    // Orders belonging to this provider
    const providerProducts = await Product.find({ provider: vetId }).select("_id");
    const productIds = providerProducts.map(p => p._id);
    
    const orders = await Order.find({ "products.product": { $in: productIds } }).populate("products.product");
    
    const orderCount = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    
    // Calculate total revenue for this provider only
    let totalRevenue = 0;
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.products.forEach(item => {
          if (item.product && (item.product.provider?.toString() === vetId || item.product._id?.toString() === vetId)) {
            totalRevenue += (item.price * item.quantity);
          }
        });
      }
    });

    res.json({
      appointments: totalAppointments,
      appointmentsPending: pending,
      appointmentsConfirmed: confirmed,
      adoptions,
      inventoryCount,
      orderCount,
      pendingOrders,
      totalRevenue: totalRevenue.toFixed(2)
    });
  } catch (err) {
    console.error('getProviderStats error:', err.message);
    res.status(500).json({ msg: err.message || 'Failed to load stats' });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const vetId = req.user?.id || req.user?._id;
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    // 1. Fetch Appointments
    const appointments = await Appointment.find({
      vet: vetId,
      createdAt: { $gte: fiveDaysAgo }
    }).populate("user", "name").sort({ createdAt: -1 });

    const appointmentActivities = appointments.map(app => ({
      _id: app._id,
      type: 'appointment',
      action: `New appointment: ${app.petName} (${app.reason})`,
      timestamp: app.createdAt,
      icon: '📅',
      color: 'blue'
    }));

    // 2. Fetch Orders
    const providerProducts = await Product.find({ provider: vetId }).select("_id");
    const productIds = providerProducts.map(p => p._id);
    const orders = await Order.find({
      "products.product": { $in: productIds },
      createdAt: { $gte: fiveDaysAgo }
    }).populate("user", "name").sort({ createdAt: -1 });

    const orderActivities = orders.map(order => ({
      _id: order._id,
      type: 'order',
      action: `New order from ${order.shippingDetails?.name || 'Customer'}`,
      timestamp: order.createdAt,
      icon: '🛍️',
      color: 'emerald'
    }));

    // 3. Fetch Recent Inventory Changes (New Products)
    const newProducts = await Product.find({
      provider: vetId,
      createdAt: { $gte: fiveDaysAgo }
    }).sort({ createdAt: -1 });

    const inventoryActivities = newProducts.map(prod => ({
      _id: prod._id,
      type: 'inventory',
      action: `Added to inventory: ${prod.name}`,
      timestamp: prod.createdAt,
      icon: '📦',
      color: 'amber'
    }));

    // Combine and sort
    const activities = [...appointmentActivities, ...orderActivities, ...inventoryActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities);
  } catch (err) {
    console.error('getRecentActivity error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch activity feed' });
  }
};
