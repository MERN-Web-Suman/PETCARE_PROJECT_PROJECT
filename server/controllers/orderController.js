import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { getIO } from "../utils/socket.js";

export const createOrder = async (req, res) => {
  try {
    const { products, shippingDetails, paymentMethod, totalAmount, paymentIntentId } = req.body;
    
    const order = await Order.create({
      user: req.user.id,
      products,
      shippingDetails,
      paymentMethod,
      totalAmount,
      paymentIntentId,
      status: req.body.status || 'Pending'
    });

    // Update stock for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Populate product details before emitting
    const populatedOrder = await Order.findById(order._id).populate('products.product');

    const io = getIO();
    if (io) io.emit("order-placed", populatedOrder);
    
    res.status(201).json(order);
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProviderOrders = async (req, res) => {
  try {
    console.log('📦 Fetching orders for provider:', req.user.id);
    
    // Orders that contain products belonging to this provider
    const providerProducts = await Product.find({ provider: req.user.id }).select("_id");
    const productIds = providerProducts.map(p => p._id);
    
    console.log(`📦 Provider has ${providerProducts.length} products`);
    console.log('📦 Product IDs:', productIds);

    const orders = await Order.find({
      "products.product": { $in: productIds }
    })
    .populate({
      path: "products.product",
      populate: { path: "provider", select: "name email" },
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

    console.log(`📦 Found ${orders.length} orders for this provider`);

    // Map through orders to format product images
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.products = orderObj.products.map(item => {
        if (item.product && item.product.image) {
          const img = item.product.image;
          item.product.image = img.startsWith('http') ? img : `http://localhost:5001/${img.replace(/\\/g, "/")}`;
          if (!item.product.images || item.product.images.length === 0) {
            item.product.images = [item.product.image];
          }
        }
        return item;
      });
      return orderObj;
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching provider orders:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).populate('products.product');
    
    const io = getIO();
    if (io) {
      io.emit("order-updated", order);
      // Emit specific notification to the ordering user's secure room
      io.to(`user-${order.user.toString()}`).emit("user-notification", {
        type: "order",
        title: "Order Status Update",
        message: `Your order #${order._id.toString().slice(-6)} is now ${order.status}!`,
        payload: order
      });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (['Shipped', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status.toLowerCase()}` });
    }

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Populate before emitting
    const populatedOrder = await Order.findById(order._id).populate('products.product');

    const io = getIO();
    if (io) io.emit("order-cancelled", populatedOrder);

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
