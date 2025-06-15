import { Resend } from 'resend';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { recipientEmail, imageFilename } = req.body;

    if (!recipientEmail || !recipientEmail.includes('@')) {
        return res.status(400).json({ message: 'Invalid recipient email address.' });
    }
    if (!imageFilename) {
        return res.status(400).json({ message: 'No image filename provided.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Replace 'Your Name' and 'info@yourdomain.com' with your desired name and email address from your verified domain.
    const SENDER_NAME = 'Your Display Gallery'; // Replace with the name you want
    const SENDER_EMAIL = 'info@YOUR_VERIFIED_DOMAIN.com'; // <--- IMPORTANT: YOU MUST REPLACE THIS!
    const BASE_URL = 'https://ipad-image-display-c5cv0ir11-kadens-projects-60eab1e9.vercel.app'; // Your Vercel domain

    try {
        const imageUrl = `${BASE_URL}/${imageFilename}`;

        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from ${imageUrl}: ${imageResponse.statusText}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        let contentType = 'application/octet-stream';
        if (imageFilename.endsWith('.jpg') || imageFilename.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (imageFilename.endsWith('.png')) {
            contentType = 'image/png';
        } else if (imageFilename.endsWith('.gif')) {
            contentType = 'image/gif';
        }

        const data = await resend.emails.send({
            from: `${Bulletin iPad} <${SENDER_EMAIL}>`, //  <---  Updated from field to include both name and email
            to: [recipientEmail],
            subject: 'Your Requested Image',
            html: `<p>&nbsp;</p>`, // Minimal body
            attachments: [
                {
                    filename: imageFilename,
                    content: imageBase64,
                    contentType: contentType
                },
            ],
        });

        console.log('Email with attachment sent successfully:', data);
        res.status(200).json({ message: 'Image sent successfully!', data });

    } catch (error) {
        console.error('Error sending email with attachment:', error);
        res.status(500).json({ message: 'Failed to send image.', error: error.message });
    }
}