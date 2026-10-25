const Contact = require("../models/Contact");

// GET /api/contact
// Admin: retrieve all customer messages
const getAllContacts = async (req, res) => {
  try {
    const messages = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      message: "Failed to retrieve messages.",
    });
  }
};

// POST /api/contact
// Public: save a message submitted from the Contact page
const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, and message are required.",
      });
    }

    const newMessage = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    res.status(201).json({
      message: "Your message has been sent successfully.",
      contact: newMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({
      message: "Failed to send your message.",
    });
  }
};

// PATCH /api/contact/:id/read
// Admin: mark a message as read
const markContactAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: "Read" },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    res.status(200).json({
      message: "Message marked as read.",
      contact,
    });
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      message: "Failed to update the message.",
    });
  }
};

// DELETE /api/contact/:id
// Admin: delete a message
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    res.status(200).json({
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      message: "Failed to delete the message.",
    });
  }
};

module.exports = {
  getAllContacts,
  createContact,
  markContactAsRead,
  deleteContact,
};  