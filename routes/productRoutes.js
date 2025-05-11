import express from 'express';
import { uploadPhone, 
    getAllPhones, 
    getPhoneDetails, 
    getVerifiedPhones, 
    getPendingPhones, 
    updatePhone,
    deletePhone,
    getPhoneBrands,
    getPhoneModels,
    getStorageVariants,
    getPhoneDetailsByBrandAndModel
} from '../controllers/productController.js';
import { validateUploadPhone } from '../middlewares/validation.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadPhoneImages } from '../middlewares/uploadPhoneImage.js';
// import { getProducts, getProductById, deleteProduct, createProduct, updateProduct, createProductReview } from '../controllers/productController.js';


const router = express.Router();

// Get all phone brands
router.get('/brands', getPhoneBrands); 

// Get models for a specific brand
router.get('/models/:brand', getPhoneModels); 

// Get storage variants for a specific model
router.get('/storage/:model', getStorageVariants); 

// get phone details by brand and model
router.get('/details/:brand/:model', getPhoneDetailsByBrandAndModel);

// Seller uplaod phone
router.post('/upload', protect,uploadPhoneImages, validateUploadPhone, uploadPhone);
// get all phones
router.get('/all', getAllPhones);


// get all verified phones
router.get('/verified', getVerifiedPhones);

// get all verified phones
router.get('/pending', getPendingPhones);

// get a phone details
router.get('/:id', getPhoneDetails);

// update phone details
router.put('/update/:id', protect, updatePhone);

// delete an uploaded phone
router.delete('/delete/:id', protect, deletePhone);






export default router;