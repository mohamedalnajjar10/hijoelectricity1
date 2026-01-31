/**
 * Email Templates
 * Centralized email HTML/text templates for consistency
 */

/**
 * Generate admin notification email template
 * @param {Object} data - Contact form data
 * @returns {Object} - { message, html }
 */
const getAdminEmailTemplate = ({ name, email, phone, message, id }) => {
    const timestamp = new Date().toLocaleString();
    
    return {
        message: `
NEW CONTACT FORM SUBMISSION

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}

Received: ${timestamp}
Contact ID: ${id}
        `.trim(),
        
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">📬 New Contact Message</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 120px;">👤 Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${escapeHtml(name)}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">📧 Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                    <a href="mailto:${escapeHtml(email)}" style="color: #667eea; text-decoration: none;">${escapeHtml(email)}</a>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">📱 Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${phone ? escapeHtml(phone) : '<em>Not provided</em>'}</td>
            </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px 0; color: #333;">💬 Message:</h3>
            <p style="margin: 0; color: #555; line-height: 1.6;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #666;">
            <p style="margin: 0;">📅 Received: ${timestamp}</p>
            <p style="margin: 0;">🆔 Contact ID: ${id}</p>
        </div>
    </div>
    
    <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 12px;">
            Reply directly to this email or contact: <a style="color:#fff;" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
        </p>
    </div>
</div>
        `.trim()
    };
};

/**
 * Generate visitor confirmation email template
 * @param {Object} data - Contact form data
 * @returns {Object} - { message, html }
 */
const getVisitorEmailTemplate = ({ name, message }) => {
    return {
        message: `
Dear ${name},

Thank you for reaching out to Hijo Electricity!

We have received your message and will get back to you as soon as possible.

Your Message:
"${message}"

Best regards,
Hijo Electricity Team
📧 hijoelectric@gmail.com
📱 00966545787952
        `.trim(),
        
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">⚡ Hijo Electricity</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-top: 0;">Dear ${escapeHtml(name)},</h2>
        
        <p style="color: #555; line-height: 1.6;">
            Thank you for reaching out to <strong>Hijo Electricity</strong>! We have received your message and will get back to you as soon as possible.
        </p>
        
        <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f5af19; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Your Message:</h4>
            <p style="margin: 0; color: #666; font-style: italic;">"${escapeHtml(message).replace(/\n/g, '<br>')}"</p>
        </div>
        
        <p style="color: #555;">
            Best regards,<br>
            <strong>Hijo Electricity Team</strong>
        </p>
    </div>
    
    <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">📧 hijoelectric@gmail.com | 📱 00966545787952</p>
    </div>
</div>
        `.trim()
    };
};

/**
 * Escape HTML special characters to prevent XSS in emails
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

module.exports = { 
    getAdminEmailTemplate, 
    getVisitorEmailTemplate,
    escapeHtml
};
