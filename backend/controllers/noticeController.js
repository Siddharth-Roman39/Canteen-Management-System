import Notice from "../models/Notice.js";

// @desc Create new notice (Admin only)
export const createNotice = async (req, res) => {
  try {
    const { title, content, date } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const notice = await Notice.create({
      title,
      content,
      date: date || Date.now(),
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Notice created successfully", notice });
  } catch (error) {
    res.status(500).json({ message: "Error creating notice", error: error.message });
  }
};

// @desc Get all notices (Everyone)
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

// @desc Delete a notice (Admin only)
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    await notice.deleteOne();
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notice", error: error.message });
  }
};
