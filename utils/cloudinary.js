// cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "rephone/profilePic",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const phoneImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "rephone/phones",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export { cloudinary, profilePicStorage, phoneImageStorage };
