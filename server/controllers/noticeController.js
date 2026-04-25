import Notice from "../models/Notice.js";

export const createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      provider: req.user.id
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("provider", "name email")
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProviderNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ provider: req.user.id })
      .populate("provider", "name email")
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const index = notice.likes.indexOf(req.user.id);
    if (index === -1) {
      notice.likes.push(req.user.id);
    } else {
      notice.likes.splice(index, 1);
    }

    await notice.save();
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rateNotice = async (req, res) => {
  try {
    const { stars } = req.body;
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const ratingIndex = notice.ratings.findIndex(r => r.user.toString() === req.user.id);
    if (ratingIndex > -1) {
      notice.ratings[ratingIndex].stars = stars;
    } else {
      notice.ratings.push({ user: req.user.id, stars });
    }

    await notice.save();
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (notice.provider.toString() !== req.user.id) {
       return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.json(updatedNotice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    
    // Check if it belongs to the provider or is admin (role check if available)
    if (notice.provider.toString() !== req.user.id) {
       return res.status(403).json({ message: "Unauthorized" });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
