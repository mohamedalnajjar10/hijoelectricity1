const nodemailer = require("nodemailer");

// Cached transporter for connection reuse
let transporter = null;

/**
 * Get or create email transporter
 * Uses connection pooling for better performance
 * @returns {Promise<nodemailer.Transporter>}
 */
const getTransporter = async () => {
    if (transporter) {
        return transporter;
    }

    const port = Number(process.env.EMAIL_PORT) || 465;
    const isSecure = port === 465;

    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Connection pooling for better performance
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        // Timeouts
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 30000,
        // Logging (only in development)
        logger: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development'
    });

    // Verify connection
    try {
        await transporter.verify();
        console.log("Email transporter initialized and ready");
    } catch (error) {
        console.error("Email transporter verification failed:", error.message);
        transporter = null;
        throw error;
    }

    return transporter;
};

/**
 * Send email using configured transporter
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} [options.html] - HTML message (optional)
 * @param {string} [options.replyTo] - Reply-to address (optional)
 * @returns {Promise<Object>} - Sent message info
 */
const sendEmail = async (options) => {
    try {
        const transport = await getTransporter();

        const mailOptions = {
            from: `"Hijo Electricity Website" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        // Add optional fields
        if (options.html) {
            mailOptions.html = options.html;
        }

        if (options.replyTo) {
            mailOptions.replyTo = options.replyTo;
        }

        const info = await transport.sendMail(mailOptions);
        
        if (process.env.NODE_ENV === 'development') {
            console.log("Email sent:", info.messageId);
        }

        return info;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        
        // Reset transporter on connection errors
        if (error.code === 'ECONNECTION' || error.code === 'EAUTH') {
            transporter = null;
        }
        
        throw error;
    }
};

/**
 * Close the email transporter connection pool
 * Call this when shutting down the application
 */
const closeTransporter = () => {
    if (transporter) {
        transporter.close();
        transporter = null;
        console.log(" Email transporter closed");
    }
};

module.exports = sendEmail;
module.exports.closeTransporter = closeTransporter;