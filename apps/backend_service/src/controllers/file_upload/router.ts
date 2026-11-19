import express from 'express';
import Handler from './handler';
import {
    validateUploadBase64,
    validateGetFreshUrl,
    validateUploadFolder,
    uploadFolderFiles,
    validateCreateRecord,
    validateBulkCreateRecords,
    validateUpdateRecord
} from './validation';

const newHandler = new Handler();
const router = express.Router();

// 1. Upload single Base64 file to Backblaze B2
router.post('/upload', validateUploadBase64, newHandler.uploadBase64);

// 2. Upload Folder of images (converts one-by-one to Base64, uploads to B2, returns signed URLs)
router.post('/upload-folder', uploadFolderFiles, validateUploadFolder, newHandler.uploadFolder);

// 3. Generate a fresh signed download URL using object_key
router.post('/get-url', validateGetFreshUrl, newHandler.getFreshUrl);

// 4. Store single image/file metadata in MongoDB 'file_upload' collection
router.post('/create', validateCreateRecord, newHandler.create);

// 5. Store multiple image/file metadata in bulk in MongoDB 'file_upload' collection
router.post('/bulk-create', validateBulkCreateRecords, newHandler.bulkCreate);

// 6. List file records (auto-refreshes signed URL in MongoDB if expires_at is < 1 hour away)
router.get('', newHandler.list);

// 7. Get single file record by id (auto-refreshes signed URL in MongoDB if expires_at is < 1 hour away)
router.get('/:id', newHandler.get);

// 8. Update file record
router.post('/:id/update', validateUpdateRecord, newHandler.update);

// 9. Delete file record
router.delete('/:id/delete', newHandler.delete);

export default router;
