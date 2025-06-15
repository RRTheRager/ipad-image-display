import { Resend } from 'resend';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { recipientEmail, imageFilename } = req.body; // Now receiving imageFilename

    if (!recipientEmail || !recipientEmail.includes('@')) {
        return res.status(400).json({ message: 'Invalid recipient email address.' });
    }
    if (!imageFilename) {
        return res.status(400).json({ message: 'No image filename provided.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const SENDER_EMAIL = 'noreply@myipadphotos.com'; // <--- IMPORTANT: REPLACE THIS with your actual verified email
    const BASE_URL = 'https://ipad-image-display.vercel.app'; // Your Vercel domain

    try {
        // Construct the full URL to the image
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
        if (imageFilename.endsWith('.jpg') || imageFilename.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (imageFilename.endsWith('.png')) {
            contentType = 'image/png';
        } else if (imageFilename.endsWith('.gif')) {
            contentType = 'image/gif';
        }

        const data = await resend.emails.send({
            from: `Your Display Gallery <${SENDER_EMAIL}>`,
            to: [recipientEmail],
            subject: 'Your Requested Image',
            html: `
                <p>Hello!</p>
                <p>Thank you for your interest. Here is the image you requested from our display iPad.</p>
                <p>You can also view the full gallery here: <a href="<span class="math-inline">\{BASE\_URL\}" target\="\_blank"\></span>{BASE_URL}</a></p>
                <p>Enjoy!</p>
                <p>Best regards,</p>
                <p>Your Display Gallery</p>
            `,
            attachments: [
                {
                    filename: imageFilename, // The original filename
                    content: imageBase64,    // The Base64 encoded image data
                    contentType: contentType // The MIME type of the image
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