import multer from 'multer';
import { phoneImageStorage } from '../utils/cloudinary.js'; // should be cloudinaryStorage

const uploadPhonePic = multer({ storage: phoneImageStorage });

// Accept multiple images (e.g. up to 5 images)
export const uploadPhoneImages = (req, res, next) => {
    uploadPhonePic.array('image', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};
