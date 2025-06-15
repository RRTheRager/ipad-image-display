import { Resend } from 'resend';

// This is the Vercel Serverless Function handler
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Get the email address from the request body
    const { recipientEmail } = req.body;

    // Basic validation
    if (!recipientEmail || !recipientEmail.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address provided.' });
    }

    // Initialize Resend with your API Key
    // The API key is securely accessed from Vercel Environment Variables
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Define the sender email address (MUST be a verified domain/email in Resend!)
    // Replace 'noreply@yourdomain.com' with an actual email address from your *verified domain*.
    // E.g., if your domain is 'myphotos.com', use 'info@myphotos.com'
    const SENDER_EMAIL = 'noreply@myipadphotos.com'; // <--- IMPORTANT: REPLACE THIS!
    const IMAGE_LINK = 'https://ipad-image-display.vercel.app/'; // <--- IMPORTANT: REPLACE THIS with your actual Vercel URL

    try {
        const data = await resend.emails.send({
            from: `Your Gallery <${SENDER_EMAIL}>`, // Display name <sender_email>
            to: [recipientEmail],
            subject: 'Your Requested Image File',
            html: `
                <p>Hello!</p>
                <p>Thank you for your interest. You requested the image files from our display iPad.</p>
                <p>You can view and download the images here: <a href="<span class="math-inline">\{IMAGE\_LINK\}" target\="\_blank"\></span>{IMAGE_LINK}</a></p>
                <p>Enjoy!</p>
                <p>Best regards,</p>
                <p>Your Display Gallery</p>
            `,
        });

        console.log('Email sent successfully:', data); // Log for debugging on Vercel
        res.status(200).json({ message: 'Email sent successfully!', data });

    } catch (error) {
        console.error('Error sending email:', error); // Log for debugging on Vercel
        res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
}