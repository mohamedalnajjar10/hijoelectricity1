const { Contact } = require("../models");
const sendEmail = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const {
  getAdminEmailTemplate,
  getVisitorEmailTemplate,
} = require("../templates/emailTemplates");

/**
 * Create new contact submission (Public)
 * POST /api/contact
 */
exports.createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log("New contact form submission from:", name, email);

  // Create contact record in database FIRST
  let newContact;
  try {
    newContact = await Contact.create({
      name,
      email,
      phone: phone || null,
      message,
    });
    console.log("Contact saved to database with ID:", newContact.id);
  } catch (dbError) {
    console.error("Database error:", dbError.message);
    return errorResponse(
      res,
      "Failed to save your message. Please try again.",
      500,
    );
  }

  // Send success response immediately (don't wait for emails)
  res.status(201).json({
    success: true,
    message: "Your message has been received! We will contact you soon.",
    data: {
      id: newContact.id,
      name: newContact.name,
      email: newContact.email,
    },
  });

  // Send emails in the background AFTER response
  try {
    await sendNotificationEmails(newContact, { name, email, phone, message });
  } catch (emailError) {
    console.error(
      "Email sending failed (message still saved):",
      emailError.message,
    );
  }
});

/**
 * Send notification emails to admin and confirmation to visitor
 * @param {Object} contact - Created contact record
 * @param {Object} formData - Original form data
 */
const sendNotificationEmails = async (
  contact,
  { name, email, phone, message },
) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  // Send admin notification
  try {
    const adminTemplate = getAdminEmailTemplate({
      name,
      email,
      phone,
      message,
      id: contact.id,
    });

    await sendEmail({
      email: adminEmail,
      replyTo: email,
      subject: `🔔 New Contact: ${name}`,
      message: adminTemplate.message,
      html: adminTemplate.html,
    });
    console.log("Admin notification sent to:", adminEmail);
  } catch (err) {
    console.error("Failed to send admin email:", err.message);
  }

  // Send visitor confirmation
  try {
    const visitorTemplate = getVisitorEmailTemplate({ name, message });

    await sendEmail({
      email: email,
      subject: "Thank you for contacting Hijo Electricity ⚡",
      message: visitorTemplate.message,
      html: visitorTemplate.html,
    });
    console.log("Visitor confirmation sent to:", email);
  } catch (err) {
    console.error("Failed to send visitor email:", err.message);
  }
};

/**
 * Get all contacts (Admin)
 * GET /api/contact
 */
exports.getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.findAll({
    order: [["createdAt", "DESC"]],
  });

  return successResponse(res, contacts, "Contacts fetched successfully");
});

/**
 * Get single contact by ID (Admin)
 * GET /api/contact/:id
 */
exports.getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);

  if (!contact) {
    return errorResponse(res, "Contact not found", 404);
  }

  return successResponse(res, contact, "Contact fetched successfully");
});

/**
 * Delete contact (Admin)
 * DELETE /api/contact/:id
 */
exports.deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);

  if (!contact) {
    return errorResponse(res, "Contact not found", 404);
  }

  await contact.destroy();

  return successResponse(res, null, "Contact deleted successfully");
});
