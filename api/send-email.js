import { Resend } from 'resend';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { recipientEmail, imageFilename } = req.body; // imageFilename will now be like "public/images/image1.jpg"

    if (!recipientEmail || !recipientEmail.includes('@')) {
        return res.status(400).json({ message: 'Invalid recipient email address.' });
    }
    if (!imageFilename) {
        return res.status(400).json({ message: 'No image filename provided.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // This is the original sender name and email format
    const SENDER_EMAIL = 'noreply@myipadphotos.com'; // <--- IMPORTANT: YOU MUST REPLACE THIS!
    const BASE_URL = 'https://ipad-image-display.vercel.app'; // Your Vercel domain

    try {
        // Construct the full URL to the image, which now correctly includes "public/images/"
        const imageUrl = `${BASE_URL}/${imageFilename}`;

        // Fetch the image data
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from ${imageUrl}: ${imageResponse.statusText}`);
        }

        // Get the image data as an ArrayBuffer
        const imageBuffer = await imageResponse.arrayBuffer();

        // Convert ArrayBuffer to Node.js Buffer and then to Base64
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        // Determine content type (simple guess from filename for common types)
        let contentType = 'application/octet-stream';
        // Extract just the filename from the path (e.g., "image1.jpg" from "public/images/image1.jpg")
        const justFilename = imageFilename.split('/').pop(); 
        
        if (justFilename.endsWith('.jpg') || justFilename.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (justFilename.endsWith('.png')) {
            contentType = 'image/png';
        } else if (justFilename.endsWith('.gif')) {
            contentType = 'image/gif';
        }

        const data = await resend.emails.send({
            from: `Your Display Gallery <${SENDER_EMAIL}>`,
            to: [recipientEmail],
            subject: 'Your Requested Image',
            html: `<p>&nbsp;</p>`, // Minimal body
            attachments: [
                {
                    filename: justFilename, // Use just the filename for the attachment name
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