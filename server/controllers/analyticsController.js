import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Notice from "../models/Notice.js";
import mongoose from "mongoose";

export const getProviderAnalytics = async (req, res) => {
  try {
    const vetId = req.user?._id || req.user?.id;
    if (!vetId) return res.status(401).json({ message: 'Unauthorized' });
    const vetObjectId = new mongoose.Types.ObjectId(vetId);

    // 1. Appointment Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trend = await Appointment.aggregate([
      {
        $match: {
          vet: vetObjectId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrend = trend.map(t => ({
      month: monthNames[t._id.month - 1],
      appointments: t.count,
      completed: t.completed,
      cancelled: t.cancelled
    }));

    // 2. Weekly Performance (Last 4 Weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const weeklyTrend = await Appointment.aggregate([
      {
        $match: {
          vet: vetObjectId,
          createdAt: { $gte: fourWeeksAgo }
        }
      },
      {
        $group: {
          _id: { $isoWeek: "$createdAt" },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const formattedWeeklyTrend = weeklyTrend.map(w => ({
      week: `Week ${w._id}`,
      total: w.count,
      completed: w.completed
    }));

    // 3. Inventory Insights
    const totalProducts = await Product.countDocuments({ provider: vetId });
    const lowStockItems = await Product.countDocuments({ provider: vetId, stock: { $lt: 5 } });
    const categoryDistribution = await Product.aggregate([
      { $match: { provider: vetObjectId } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // 4. Order & Revenue Trend (Last 6 Months)
    const providerProducts = await Product.find({ provider: vetId }).select("_id");
    const productIdsArray = providerProducts.map(p => p._id);

    const orderTrend = await Order.aggregate([
      {
        $match: {
          "products.product": { $in: productIdsArray },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formattedOrderTrend = orderTrend.map(ot => ({
      month: monthNames[ot._id.month - 1],
      orders: ot.orderCount,
      revenue: Math.round(ot.revenue)
    }));

    // 5. Notice Stats
    const totalNotices = await Notice.countDocuments({ provider: vetId });
    const noticeEngagement = await Notice.aggregate([
      { $match: { provider: vetObjectId } },
      { $group: { 
          _id: null, 
          totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
          avgRating: { $avg: { $avg: "$ratings.stars" } }
        } 
      }
    ]);

    // 6. Clinic Performance
    const clinics = await Clinic.find({ provider: vetId });
    const performance = await Promise.all(clinics.map(async (c) => {
      const stats = await Appointment.aggregate([
        { $match: { clinic: c._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } }
          }
        }
      ]);

      return {
        name: c.name,
        doctor: c.doctorName,
        total: stats[0]?.total || 0,
        confirmed: stats[0]?.confirmed || 0,
        completionRate: stats[0]?.total ? Math.round((stats[0].confirmed / stats[0].total) * 100) : 0
      };
    }));

    // Summary Metrics
    const totalAppointments = await Appointment.countDocuments({ vet: vetId });
    const confirmedCount = await Appointment.countDocuments({ vet: vetId, status: 'confirmed' });
    const totalOrdersCount = await Order.countDocuments({ "products.product": { $in: productIdsArray } });

    res.json({
      trend: formattedTrend,
      weeklyTrend: formattedWeeklyTrend,
      orderTrend: formattedOrderTrend,
      inventory: {
        totalProducts,
        lowStockItems,
        categoryDistribution: categoryDistribution.map(cd => ({ name: cd._id || 'Uncategorized', value: cd.count }))
      },
      notices: {
        total: totalNotices,
        likes: noticeEngagement[0]?.totalLikes || 0,
        avgRating: noticeEngagement[0]?.avgRating ? noticeEngagement[0].avgRating.toFixed(1) : "0.0"
      },
      performance,
      summary: {
        totalAppointments,
        confirmedCount,
        totalOrders: totalOrdersCount,
        locationsCount: clinics.length,
        completionRate: totalAppointments ? Math.round((confirmedCount / totalAppointments) * 100) : 0
      }
    });

  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
