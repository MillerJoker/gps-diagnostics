import { Router } from 'express';
import multer from 'multer';
import { processReport } from '../controllers/report_controller.js';

const router = Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', upload.single('file'), processReport);

export default router;