import { readdir } from 'fs/promises'; // Used to read directory contents
import { join } from 'path'; // Used to construct file paths

export default async function handler(req, res) {
    // Only allow GET requests for listing images
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Construct the path to the images directory
    // process.cwd() gets the current working directory of the Vercel function
    const imagesDirectory = join(process.cwd(), 'public', 'images');

    try {
        // Read the contents of the images directory
        // { withFileTypes: true } allows us to easily check if it's a file
        const files = await readdir(imagesDirectory, { withFileTypes: true });

        // Filter out directories and non-image files, then map to just their names
        const imageFiles = files
            .filter(dirent => dirent.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(dirent.name))
            .map(dirent => dirent.name);

        // Send the list of image filenames as a JSON response
        res.status(200).json(imageFiles);

    } catch (error) {
        console.error('Error listing images:', error);
        // Handle cases where the directory might not be found
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: 'Image directory not found. Please ensure images are in /public/images.' });
        } else {
            res.status(500).json({ message: 'Failed to list images.', error: error.message });
        }
    }
}