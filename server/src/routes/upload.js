import { Router } from 'express';
import multer from 'multer';
import { authorize } from '../middleware/authorize.js';
import { uploadImageBuffer } from '../services/supabaseUpload.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', authorize, upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Field "image" with a file is required.' });
    }

    const url = await uploadImageBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json({ url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Upload failed.' });
  }
});

export default router;
