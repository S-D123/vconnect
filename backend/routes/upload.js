const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const authorize = require('../middleware/authorize');

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Set up Multer to store the file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST: Upload an image to Supabase Storage
router.post('/', authorize, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json("No file uploaded");
        }

        // Create a unique file name to prevent overwriting (e.g., 167890123-myphoto.jpg)
        const uniqueFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

        // Upload the file to the 'uploads' bucket
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(uniqueFileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) throw error;

        // Get the public URL of the uploaded image
        const publicUrlData = supabase.storage
            .from('uploads')
            .getPublicUrl(uniqueFileName);

        const imageUrl = publicUrlData.data.publicUrl;

        // Return the URL to the React frontend
        res.json({ imageUrl });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error during upload");
    }
});

module.exports = router;