import multer from 'multer';
import { profilePicStorage } from '../utils/cloudinary.js';

const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
});

export const upload = (req, res, next) => {
  uploadProfilePic.single('profilePic')(req, res, (err) => {
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
      // Skip error if file is not provided
      return next(); 
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
