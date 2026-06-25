const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

router.post('/send-bulk-email', verifyToken, async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ message: 'Missing required fields: to, subject, html' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const recipients = Array.isArray(to) ? to : [to];
        let successCount = 0;
        let failCount = 0;

        // Loop and send individually to ensure proper "To:" field and privacy
        for (const recipientEmail of recipients) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: recipientEmail,
                    subject: subject,
                    html: html
                };
                await transporter.sendMail(mailOptions);
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${recipientEmail}:`, err);
                failCount++;
            }
        }
        
        res.status(200).json({ 
            success: true, 
            message: `Emails sent successfully to ${successCount} recipients. ${failCount > 0 ? `Failed for ${failCount}.` : ''}` 
        });

    } catch (error) {
        console.error('Error sending bulk emails:', error);
        res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
    }
});

module.exports = router;
