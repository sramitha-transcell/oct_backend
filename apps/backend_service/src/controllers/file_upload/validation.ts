import { z } from 'zod';
import { apiResponse } from '@oct-backend/shared-utils';
import multer from 'multer';

// Configure multer with memory storage for handling multipart folder uploads
const memoryStorage = multer.memoryStorage();
const multerUploader = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file limit
        files: 100 // up to 100 images
    }
});

/**
 * Middleware that parses multipart/form-data for folder/multiple image uploads
 * Passes through transparently if request is application/json
 */
export const uploadFolderFiles = (req: any, res: any, next: any): void => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        multerUploader.any()(req, res, (err: any) => {
            if (err) {
                res.status(400).json(
                    apiResponse.FAILURE_RESP(
                        {},
                        { name: 'MulterUploadError', message: err.message },
                        err.message || 'Error processing multipart files'
                    )
                );
                return;
            }
            next();
        });
        return;
    }
    next();
};

/**
 * Validates that at least one of multipart files, local folder_path, or files/images array is supplied
 */
export function validateUploadFolder(req: any, res: any, next: any) {
    const hasMultipartFiles = Array.isArray(req.files) && req.files.length > 0;
    const hasFolderPath = (typeof req.body?.folder_path === 'string' && req.body.folder_path.trim().length > 0)
        || (typeof req.body?.folderPath === 'string' && req.body.folderPath.trim().length > 0)
        || (typeof req.query?.folder_path === 'string' && req.query.folder_path.trim().length > 0)
        || (typeof req.query?.folderPath === 'string' && req.query.folderPath.trim().length > 0);
    const hasBodyFiles = (Array.isArray(req.body?.files) && req.body.files.length > 0)
        || (Array.isArray(req.body?.images) && req.body.images.length > 0);

    if (!hasMultipartFiles && !hasFolderPath && !hasBodyFiles) {
        return res.status(400).json(
            apiResponse.FAILURE_RESP(
                {},
                {
                    name: 'ValidationError',
                    message: 'Please provide images via multipart/form-data (key: files or images), a local folder_path, or an array of files in JSON'
                },
                'No images or folder provided'
            )
        );
    }
    return next();
}

export const UploadBase64Schema = z.object({
    file_base64: z.string().min(1, 'file_base64 is required').optional(),
    fileBase64: z.string().min(1, 'fileBase64 is required').optional(),
    filename: z.string().min(1, 'filename is required'),
    mime_type: z.string().optional(),
    mimeType: z.string().optional(),
    folder: z.string().optional().default('uploads'),
    expires_in: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expiresIn: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    bucket: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
}).refine(data => !!(data.file_base64 || data.fileBase64), {
    message: 'Either file_base64 or fileBase64 is required',
    path: ['file_base64'],
});

export const PresignedDownloadSchema = z.object({
    object_key: z.string().min(1, 'object_key is required').optional(),
    objectKey: z.string().min(1, 'objectKey is required').optional(),
    expires_in: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expiresIn: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    bucket: z.string().optional(),
}).refine(data => !!(data.object_key || data.objectKey), {
    message: 'Either object_key or objectKey is required',
    path: ['object_key'],
});

export const PresignedUploadSchema = z.object({
    filename: z.string().min(1, 'filename is required'),
    mime_type: z.string().optional(),
    mimeType: z.string().optional(),
    folder: z.string().optional().default('uploads'),
    expires_in: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expiresIn: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    bucket: z.string().optional(),
});

export const DeleteFileSchema = z.object({
    object_key: z.string().min(1, 'object_key is required').optional(),
    objectKey: z.string().min(1, 'objectKey is required').optional(),
    bucket: z.string().optional(),
});

export const GetFreshUrlsBatchSchema = z.object({
    object_keys: z.array(z.string().min(1)).min(1, 'object_keys array must not be empty').optional(),
    objectKeys: z.array(z.string().min(1)).min(1, 'objectKeys array must not be empty').optional(),
    expires_in: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expiresIn: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    bucket: z.string().optional(),
}).refine(data => !!((data.object_keys && data.object_keys.length > 0) || (data.objectKeys && data.objectKeys.length > 0)), {
    message: 'Either object_keys or objectKeys array is required',
    path: ['object_keys'],
});

export function validateGetFreshUrlsBatch(req: any, res: any, next: any) {
    const result = GetFreshUrlsBatchSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

export function validateUploadBase64(req: any, res: any, next: any) {
    const result = UploadBase64Schema.safeParse(req.body);
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

export function validateGetFreshUrl(req: any, res: any, next: any) {
    const result = PresignedDownloadSchema.safeParse({ ...req.body, ...req.query });
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

export function validatePresignedDownload(req: any, res: any, next: any) {
    const result = PresignedDownloadSchema.safeParse({ ...req.body, ...req.query });
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

export function validatePresignedUpload(req: any, res: any, next: any) {
    const result = PresignedUploadSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

/**
 * Schema for storing a single file/image URL record in MongoDB (file_upload collection)
 */
export const SingleFileRecordSchema = z.object({
    filename: z.string().min(1, 'filename is required'),
    object_key: z.string().min(1, 'object_key is required').optional(),
    objectKey: z.string().min(1, 'objectKey is required').optional(),
    file_url: z.string().min(1, 'file_url is required').optional(),
    fileUrl: z.string().min(1, 'fileUrl is required').optional(),
    category: z.string().optional().default('general'),
    sub_category: z.string().optional(),
    subCategory: z.string().optional(),
    file_type: z.string().optional(),
    fileType: z.string().optional(),
    mime_type: z.string().optional(),
    mimeType: z.string().optional(),
    project_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    projectId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expires_in: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expiresIn: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    size: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    created_at: z.union([z.number(), z.string(), z.date()]).optional(),
    createdAt: z.union([z.number(), z.string(), z.date()]).optional(),
    expires_at: z.union([z.number(), z.string(), z.date()]).optional(),
    expiresAt: z.union([z.number(), z.string(), z.date()]).optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
}).refine(data => !!(data.object_key || data.objectKey), {
    message: 'Either object_key or objectKey is required',
    path: ['object_key'],
}).refine(data => !!(data.file_url || data.fileUrl), {
    message: 'Either file_url or fileUrl is required',
    path: ['file_url'],
});

export function validateCreateRecord(req: any, res: any, next: any) {
    // If user passed an array to /create, accept it or validate as single
    const isArray = Array.isArray(req.body);
    if (isArray) {
        if (req.body.length === 0) {
            return res.status(400).json(apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'Request array cannot be empty' }, 'Empty array provided'));
        }
        for (let i = 0; i < req.body.length; i++) {
            const itemResult = SingleFileRecordSchema.safeParse(req.body[i]);
            if (!itemResult.success) {
                return res.status(400).json(apiResponse.FAILURE_RESP({}, itemResult.error.issues, `Validation failed at index ${i}`));
            }
        }
        return next();
    }

    const result = SingleFileRecordSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

/**
 * Schema for bulk creating file/image URL records
 */
export function validateBulkCreateRecords(req: any, res: any, next: any) {
    let items: any[] = [];
    if (Array.isArray(req.body)) {
        items = req.body;
    } else if (Array.isArray(req.body?.files)) {
        items = req.body.files;
    } else if (Array.isArray(req.body?.images)) {
        items = req.body.images;
    } else if (Array.isArray(req.body?.records)) {
        items = req.body.records;
    } else {
        return res.status(400).json(
            apiResponse.FAILURE_RESP(
                {},
                { name: 'ValidationError', message: 'Body must be an array or contain a files/images/records array' },
                'Invalid bulk create payload'
            )
        );
    }

    if (items.length === 0) {
        return res.status(400).json(
            apiResponse.FAILURE_RESP(
                {},
                { name: 'ValidationError', message: 'Array of records cannot be empty' },
                'Empty bulk create payload'
            )
        );
    }

    const parentCategory = req.body?.category;
    const parentSubCategory = req.body?.sub_category || req.body?.subCategory;
    const parentProjectId = req.body?.project_id || req.body?.projectId;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (parentCategory && !item.category) item.category = parentCategory;
        if (parentSubCategory && !item.sub_category && !item.subCategory) item.sub_category = parentSubCategory;
        if (parentProjectId && !item.project_id && !item.projectId) item.project_id = parentProjectId;

        const result = SingleFileRecordSchema.safeParse(item);
        if (!result.success) {
            return res.status(400).json(
                apiResponse.FAILURE_RESP({}, result.error.issues, `Validation failed for record at index ${i}`)
            );
        }
    }

    return next();
}

export const UpdateFileRecordSchema = z.object({
    filename: z.string().optional(),
    object_key: z.string().optional(),
    file_url: z.string().optional(),
    category: z.string().optional(),
    sub_category: z.string().optional(),
    subCategory: z.string().optional(),
    file_type: z.string().optional(),
    mime_type: z.string().optional(),
    project_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    expires_in: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    size: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    created_at: z.union([z.number(), z.string(), z.date()]).optional(),
    expires_at: z.union([z.number(), z.string(), z.date()]).optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export function validateUpdateRecord(req: any, res: any, next: any) {
    const result = UpdateFileRecordSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result.error.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, 'Validation Failed'));
    }
    return next();
}

export default validateUploadBase64;
