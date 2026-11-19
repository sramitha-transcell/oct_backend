import Service from './service';
import { apiResponse } from '@oct-backend/shared-utils';

const newService = new Service();

class Handler {
    /**
     * Upload base64 encoded file to Backblaze B2
     */
    async uploadBase64(req: any, res: any, next: any) {
        try {
            const { body } = req;
            const fileBase64 = body.file_base64 || body.fileBase64;
            const filename = body.filename;
            const mimeType = body.mime_type || body.mimeType;
            const folder = body.folder || 'uploads';
            const expiresIn = body.expires_in !== undefined ? Number(body.expires_in) : (body.expiresIn !== undefined ? Number(body.expiresIn) : 3600);
            const bucket = body.bucket;
            const metadata = body.metadata;

            const resp = await newService.uploadBase64({
                fileBase64,
                filename,
                mimeType,
                folder,
                expiresIn,
                bucket,
                metadata
            });

            if (!resp.success) {
                return res.status(500).json(
                    apiResponse.FAILURE_RESP(
                        {},
                        { name: 'B2UploadError', message: resp.error },
                        resp.error || 'Failed to upload file to Backblaze B2'
                    )
                );
            }

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(resp, 'File uploaded to Backblaze B2 successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Upload a folder containing multiple images (e.g. 20-30 images):
     * Converts each image one by one into base64, uploads to Backblaze B2, and returns the signed URL response.
     */
    async uploadFolder(req: any, res: any, next: any) {
        try {
            const files = req.files as Express.Multer.File[] | undefined;
            const body = req.body || {};
            const query = req.query || {};

            const folder = body.folder || query.folder || 'wound_healing';
            const folderPath = body.folder_path || body.folderPath || query.folder_path || query.folderPath;
            const expiresIn = body.expires_in !== undefined ? Number(body.expires_in) : (query.expires_in !== undefined ? Number(query.expires_in) : 5 * 24 * 3600); // 30 days default
            const bucket = body.bucket || query.bucket;
            const includeBase64 = body.include_base64 === true || body.include_base64 === 'true' || query.include_base64 === 'true';
            const outputJsonPath = body.output_json_path || body.outputJsonPath || query.output_json_path || query.outputJsonPath;

            const bodyFiles = body.files || body.images;

            const resp = await newService.uploadFolder({
                files: files && files.length > 0 ? files : bodyFiles,
                folderPath,
                folder,
                expiresIn,
                bucket,
                includeBase64,
                outputJsonPath
            });

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(
                    resp,
                    `Folder upload completed: ${resp.uploaded_count} of ${resp.total_files} images converted to Base64 and uploaded to Backblaze B2 successfully`
                )
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Generate presigned download URL for an existing file in B2
     */
    async getPresignedDownloadUrl(req: any, res: any, next: any) {
        try {
            const objectKey = req.body.object_key || req.body.objectKey || req.query.object_key || req.query.objectKey;
            const expiresIn = req.body.expires_in !== undefined ? Number(req.body.expires_in) : (req.query.expires_in !== undefined ? Number(req.query.expires_in) : 3600);
            const bucket = req.body.bucket || req.query.bucket;

            if (!objectKey) {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'object_key is required' }, 'object_key is required')
                );
            }

            const fileUrl = await newService.getPresignedDownloadUrl(objectKey, expiresIn, bucket);

            return res.status(200).json(
                apiResponse.SUCCESS_RESP({
                    object_key: objectKey,
                    file_url: fileUrl,
                    expires_in: expiresIn
                }, 'Presigned download URL generated successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Generate fresh signed URL for an existing file in B2 whenever required
     */
    async getFreshUrl(req: any, res: any, next: any) {
        try {
            const rawKey = req.body?.object_key || req.body?.objectKey || req.query?.object_key || req.query?.objectKey || req.params?.key;
            const objectKey = rawKey ? decodeURIComponent(rawKey) : undefined;
            const expiresIn = req.body?.expires_in !== undefined ? Number(req.body.expires_in) : (req.query?.expires_in !== undefined ? Number(req.query.expires_in) : 3600);
            const bucket = req.body?.bucket || req.query?.bucket;

            if (!objectKey) {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'object_key is required' }, 'object_key is required')
                );
            }

            const resp = await newService.getFreshUrl(objectKey, expiresIn, bucket);

            if (!resp.success) {
                return res.status(500).json(
                    apiResponse.FAILURE_RESP({}, { name: 'B2UrlError', message: resp.error }, resp.error || 'Failed to generate fresh URL')
                );
            }

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(resp, 'Fresh URL generated successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Generate fresh signed URLs for multiple object keys in batch
     */
    async getFreshUrlsBatch(req: any, res: any, next: any) {
        try {
            const { body } = req;
            const objectKeys = body.object_keys || body.objectKeys;
            const expiresIn = body.expires_in !== undefined ? Number(body.expires_in) : (body.expiresIn !== undefined ? Number(body.expiresIn) : 3600);
            const bucket = body.bucket;

            const results = await newService.getFreshUrls(objectKeys, expiresIn, bucket);

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(results, 'Batch fresh URLs generated successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * View or redirect to file using an on-the-fly fresh signed URL
     * This allows permanent link usage (e.g. in img tags or direct downloads)
     */
    async viewOrRedirectFile(req: any, res: any, next: any) {
        try {
            const rawKey = req.query?.object_key || req.query?.objectKey || req.params?.key;
            const objectKey = rawKey ? decodeURIComponent(rawKey) : undefined;
            const expiresIn = req.query?.expires_in !== undefined ? Number(req.query.expires_in) : 3600;
            const bucket = req.query?.bucket;

            if (!objectKey) {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'object_key is required' }, 'object_key is required')
                );
            }

            const resp = await newService.getFreshUrl(objectKey, expiresIn, bucket);

            if (!resp.success || !resp.file_url) {
                return res.status(404).json(
                    apiResponse.FAILURE_RESP({}, { name: 'FileNotFound', message: resp.error || 'File not found' }, 'File not found')
                );
            }

            // Redirect the browser/client directly to the fresh signed URL
            return res.redirect(302, resp.file_url);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Generate presigned PUT URL for direct client-to-B2 uploads
     */
    async getPresignedUploadUrl(req: any, res: any, next: any) {
        try {
            const { body } = req;
            const filename = body.filename;
            const mimeType = body.mime_type || body.mimeType;
            const folder = body.folder || 'uploads';
            const expiresIn = body.expires_in !== undefined ? Number(body.expires_in) : (body.expiresIn !== undefined ? Number(body.expiresIn) : 3600);
            const bucket = body.bucket;

            const resp = await newService.getPresignedUploadUrl({
                filename,
                mimeType,
                folder,
                expiresIn,
                bucket
            });

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(resp, 'Presigned upload URL generated successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Delete an object from Backblaze B2
     */
    async deleteFile(req: any, res: any, next: any) {
        try {
            const rawKey = req.body?.object_key || req.body?.objectKey || req.query?.object_key || req.query?.objectKey || req.params?.key;
            const objectKey = rawKey ? decodeURIComponent(rawKey) : undefined;
            const bucket = req.body?.bucket || req.query?.bucket;

            if (!objectKey) {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'object_key is required' }, 'object_key is required')
                );
            }

            const resp = await newService.deleteFile(objectKey, bucket);

            if (!resp.success) {
                return res.status(500).json(
                    apiResponse.FAILURE_RESP({}, { name: 'B2DeleteError', message: resp.error }, resp.error || 'Failed to delete file from B2')
                );
            }

            return res.status(200).json(
                apiResponse.SUCCESS_RESP({ object_key: objectKey }, 'File deleted successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Store single file / image URL metadata in MongoDB file_upload collection
     */
    async create(req: any, res: any, next: any) {
        try {
            const body = req.body;
            if (Array.isArray(body)) {
                const normalizedList = body.map((item: any) => normalizeFileRecord(item));
                const created = await newService.bulkCreateRecords(normalizedList);
                return res.status(201).json(
                    apiResponse.SUCCESS_RESP(created, `Successfully created ${normalizedList.length} file record(s)`)
                );
            }

            const normalized = normalizeFileRecord(body);
            const created = await newService.createRecord(normalized);
            return res.status(201).json(
                apiResponse.SUCCESS_RESP(created, 'File record stored successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Store multiple file / image URL metadata in bulk in MongoDB file_upload collection
     */
    async bulkCreate(req: any, res: any, next: any) {
        try {
            const body = req.body;
            let items: any[] = [];
            let fallbackCategory = 'general';
            let fallbackProjectId: number | undefined;

            if (Array.isArray(body)) {
                items = body;
            } else if (body && typeof body === 'object') {
                fallbackCategory = body.category || 'general';
                fallbackProjectId = body.project_id !== undefined ? Number(body.project_id) : (body.projectId !== undefined ? Number(body.projectId) : undefined);
                items = body.files || body.images || body.records || [];
            }

            if (!items || items.length === 0) {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'No records provided for bulk create' }, 'No records provided')
                );
            }

            const normalizedList = items.map((item: any) => normalizeFileRecord(item, fallbackCategory, fallbackProjectId));
            const created = await newService.bulkCreateRecords(normalizedList);

            return res.status(201).json(
                apiResponse.SUCCESS_RESP(created, `Bulk created ${normalizedList.length} file record(s) successfully`)
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Get a single file record by ID or object_key.
     * Automatically calls getFreshUrl and updates the record in MongoDB if expires_at is less than 1 hour away!
     */
    async get(req: any, res: any, next: any) {
        try {
            const paramId = req.params?.id;
            const queryKey = req.query?.object_key || req.query?.objectKey;

            let query: any = {};
            if (paramId) {
                const numericId = Number(paramId);
                if (!isNaN(numericId)) {
                    query = { id: numericId };
                } else {
                    query = { _id: paramId };
                }
            } else if (queryKey) {
                query = { object_key: queryKey };
            } else {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'File id or object_key is required' }, 'Missing identifier')
                );
            }

            const record = await newService.getRecord(query);

            if (!record) {
                return res.status(404).json(
                    apiResponse.FAILURE_RESP({}, { name: 'NotFound', message: 'File record not found' }, 'File record not found')
                );
            }

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(record, 'File record retrieved successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * List file records with filtering and pagination.
     * Automatically refreshes any file URLs whose expires_at is less than 1 hour away!
     */
    async list(req: any, res: any, next: any) {
        try {
            const queryParams = req.query || {};
            const pageNo = queryParams.page_no ? Number(queryParams.page_no) : (queryParams.page ? Number(queryParams.page) : 1);
            const perPage = queryParams.per_page ? Number(queryParams.per_page) : (queryParams.limit ? Number(queryParams.limit) : 20);

            const mongoQuery: any = {};

            if (queryParams.category) {
                mongoQuery.category = queryParams.category;
            }
            if (queryParams.project_id || queryParams.projectId) {
                mongoQuery.project_id = Number(queryParams.project_id || queryParams.projectId);
            }
            if (queryParams.file_type || queryParams.fileType) {
                mongoQuery.file_type = queryParams.file_type || queryParams.fileType;
            }
            if (queryParams.status) {
                mongoQuery.status = queryParams.status;
            }
            if (queryParams.is_active !== undefined) {
                mongoQuery.is_active = queryParams.is_active === 'true' || queryParams.is_active === true;
            }
            if (queryParams.search || queryParams.filename) {
                const term = queryParams.search || queryParams.filename;
                mongoQuery.filename = { $regex: term, $options: 'i' };
            }

            const sort: any = { createdAt: -1 };
            if (queryParams.sort_by) {
                const order = queryParams.sort_order === 'asc' || queryParams.order === 'asc' ? 1 : -1;
                sort[queryParams.sort_by] = order;
            }

            const result = await newService.listRecords(mongoQuery, perPage, pageNo, sort);

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(result, 'File records fetched successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Update an existing file record
     */
    async update(req: any, res: any, next: any) {
        try {
            const paramId = req.params?.id;
            const numericId = Number(paramId);
            const query = !isNaN(numericId) ? { id: numericId } : { _id: paramId };

            const updateData: any = { ...req.body };
            delete updateData.id;
            delete updateData._id;

            if (updateData.created_at || updateData.createdAt) {
                updateData.created_at = parseTimestampToDate(updateData.created_at ?? updateData.createdAt);
            }
            if (updateData.expires_at || updateData.expiresAt) {
                updateData.expires_at = parseTimestampToDate(updateData.expires_at ?? updateData.expiresAt);
            }
            if (updateData.expires_in) {
                updateData.expires_in = Number(updateData.expires_in);
            }
            if (updateData.project_id) {
                updateData.project_id = Number(updateData.project_id);
            }

            const updated = await newService.updateRecord(query, updateData);

            if (!updated) {
                return res.status(404).json(
                    apiResponse.FAILURE_RESP({}, { name: 'NotFound', message: 'File record not found to update' }, 'File record not found')
                );
            }

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(updated, 'File record updated successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Delete a file record
     */
    async delete(req: any, res: any, next: any) {
        try {
            const paramId = req.params?.id;
            const numericId = Number(paramId);
            const query = !isNaN(numericId) ? { id: numericId } : { _id: paramId };

            const deleted = await newService.deleteRecord(query);

            if (!deleted) {
                return res.status(404).json(
                    apiResponse.FAILURE_RESP({}, { name: 'NotFound', message: 'File record not found to delete' }, 'File record not found')
                );
            }

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(deleted, 'File record deleted successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Upsert a file record matching query
     */
    async upsert(req: any, res: any, next: any) {
        try {
            const { body } = req;
            const query: any = {};
            if (body.id) {
                query.id = Number(body.id);
            } else if (body.object_key || body.objectKey) {
                query.object_key = body.object_key || body.objectKey;
            } else {
                return res.status(400).json(
                    apiResponse.FAILURE_RESP({}, { name: 'ValidationError', message: 'id or object_key is required for upsert' }, 'Missing identifier')
                );
            }

            const normalized = normalizeFileRecord(body);
            const result = await newService.upsertRecord(query, normalized);

            return res.status(200).json(
                apiResponse.SUCCESS_RESP(result, 'File record upserted successfully')
            );
        } catch (err: any) {
            next(err);
        }
    }
}

function parseTimestampToDate(val: any): Date | undefined {
    if (val === undefined || val === null || val === '') return undefined;
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
        return new Date(val > 10000000000 ? val : val * 1000);
    }
    const num = Number(val);
    if (!isNaN(num) && /^\d+$/.test(String(val).trim())) {
        return new Date(num > 10000000000 ? num : num * 1000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}

function normalizeFileRecord(item: any, fallbackCategory = 'general', fallbackProjectId?: number) {
    const filename = item.filename;
    const object_key = item.object_key || item.objectKey;
    const file_url = item.file_url || item.fileUrl;
    const category = item.category || fallbackCategory;
    const mime_type = item.mime_type || item.mimeType;
    const file_type = item.file_type || item.fileType;
    const size = item.size !== undefined ? Number(item.size) : undefined;
    const expires_in = item.expires_in !== undefined ? Number(item.expires_in) : (item.expiresIn !== undefined ? Number(item.expiresIn) : 2592000);
    const project_id = item.project_id !== undefined ? Number(item.project_id) : (item.projectId !== undefined ? Number(item.projectId) : fallbackProjectId);

    const createdAt = parseTimestampToDate(item.created_at ?? item.createdAt) || new Date();
    let expiresAt = parseTimestampToDate(item.expires_at ?? item.expiresAt);
    if (!expiresAt && expires_in) {
        expiresAt = new Date(createdAt.getTime() + expires_in * 1000);
    }

    return {
        filename,
        object_key,
        file_url,
        category,
        file_type,
        mime_type,
        size,
        expires_in,
        project_id,
        created_at: createdAt,
        expires_at: expiresAt,
        status: item.status || 'active',
        is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
        metadata: item.metadata || {}
    };
}

export default Handler;

