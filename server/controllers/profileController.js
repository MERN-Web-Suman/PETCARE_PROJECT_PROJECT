import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Appointment from "../models/Appointment.js";
import Post from "../models/Post.js";
import Order from "../models/Order.js";

export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [petCount, appointmentCount, postCount, user] = await Promise.all([
      Pet.countDocuments({ owner: userId }),
      Appointment.countDocuments({ user: userId }),
      Post.countDocuments({ author: userId }),
      User.findById(userId)
    ]);

    res.json({
      petCount,
      appointments: appointmentCount,
      communityPosts: postCount,
      adoptionsSaved: user?.savedPets?.length || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch latest items from different collections
    const [latestPets, latestAppts, latestPosts, latestOrders] = await Promise.all([
      Pet.find({ owner: userId }).sort({ createdAt: -1 }).limit(3),
      Appointment.find({ user: userId }).sort({ createdAt: -1 }).limit(3).populate("clinic", "name"),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(3),
      Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3)
    ]);

    // Format them into a unified activity structure
    const activities = [
      ...latestPets.map(p => ({
        id: p._id,
        type: "pet",
        title: "Added New Pet",
        description: `Registered ${p.name} (${p.breed || p.type})`,
        date: p.createdAt,
        icon: "🐾",
        color: "primary"
      })),
      ...latestAppts.map(a => ({
        id: a._id,
        type: "appointment",
        title: "Appointment Scheduled",
        description: `Checkup at ${a.clinic?.name || "Clinic"}`,
        date: a.date,
        icon: "📝",
        color: "secondary"
      })),
      ...latestPosts.map(p => ({
        id: p._id,
        type: "post",
        title: "Posted in Community",
        description: p.content.substring(0, 40) + "...",
        date: p.createdAt,
        icon: "❤️",
        color: "accent"
      })),
      ...latestOrders.map(o => ({
        id: o._id,
        type: "order",
        title: "Placed an Order",
        description: `Order total: $${o.totalAmount}`,
        date: o.createdAt,
        icon: "🛍️",
        color: "yellow"
      }))
    ];

    // Sort by date descending and limit to 5
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json(sortedActivities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleSavePet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.savedPets.indexOf(id);
    if (index === -1) {
      user.savedPets.push(id);
    } else {
      user.savedPets.splice(index, 1);
    }

    await user.save();
    res.json(user.savedPets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSavedPets = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("savedPets");
        res.json(user.savedPets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
