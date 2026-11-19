import fs from 'node:fs';
import path from 'node:path';
import {
    B2StorageService,
    UploadBase64Options,
    UploadBufferOptions,
    PresignedUploadOptions,
    B2UploadResult,
    FileUpload,
    CreateFileUpload,
    BulkCreateFileUpload,
    UpdateFileUpload,
    DeleteFileUpload,
    GetFileUpload,
    ListFileUpload,
    UpsertFileUpload
} from '@oct-backend/shared-utils';
import { GlobalEnv } from '../../config/env';

export interface FolderFileItem {
    filename?: string;
    buffer?: Buffer;
    fileBase64?: string;
    file_base64?: string;
    mimeType?: string;
    mimetype?: string;
    size?: number;
    originalname?: string;
}

export interface UploadFolderOptions {
    files?: FolderFileItem[];
    folderPath?: string;
    folder?: string;
    expiresIn?: number;
    bucket?: string;
    includeBase64?: boolean;
    outputJsonPath?: string;
}

export interface UploadFolderItemResult {
    filename: string;
    object_key?: string;
    file_url?: string;
    mime_type?: string;
    size?: number;
    expires_in?: number;
    file_base64?: string;
    success: boolean;
    error?: string;
}

export interface UploadFolderResponse {
    folder: string;
    total_files: number;
    uploaded_count: number;
    failed_count: number;
    json_file?: string;
    files: UploadFolderItemResult[];
}

const IMAGE_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.tif', '.tiff', '.ico'
]);

function isImageFilename(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

function getMimeTypeFromFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.webp': return 'image/webp';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        case '.bmp': return 'image/bmp';
        case '.tif':
        case '.tiff': return 'image/tiff';
        case '.ico': return 'image/x-icon';
        default: return 'application/octet-stream';
    }
}

class FileUploadService {
    private storage: B2StorageService;

    constructor() {
        this.storage = new B2StorageService({
            endpoint: GlobalEnv.B2_ENDPOINT,
            keyId: GlobalEnv.B2_KEY_ID,
            applicationKey: GlobalEnv.B2_APPLICATION_KEY,
            region: GlobalEnv.B2_REGION,
            bucket: GlobalEnv.B2_BUCKET
        });
    }

    /**
     * Upload base64 encoded file to Backblaze B2
     */
    async uploadBase64(options: UploadBase64Options): Promise<B2UploadResult> {
        try {
            return await this.storage.uploadBase64(options);
        } catch (err) {
            console.error("FileUploadService.uploadBase64 error ====>", err);
            throw err;
        }
    }

    /**
     * Upload binary buffer to Backblaze B2
     */
    async uploadBuffer(options: UploadBufferOptions): Promise<B2UploadResult> {
        try {
            return await this.storage.uploadBuffer(options);
        } catch (err) {
            console.error("FileUploadService.uploadBuffer error ====>", err);
            throw err;
        }
    }

    /**
     * Upload a folder of images or multiple files:
     * Iterates one by one, converts each image into base64, uploads to Backblaze B2, and returns presigned URLs
     */
    async uploadFolder(options: UploadFolderOptions): Promise<UploadFolderResponse> {
        try {
            const {
                files,
                folderPath,
                folder = 'wound_healing',
                expiresIn = 5 * 24 * 3600, // 5 days default
                bucket,
                includeBase64 = false,
                outputJsonPath = path.resolve(process.cwd(), 'docs', 'uploaded_files.json')
            } = options;

            const itemsToProcess: Array<{
                filename: string;
                buffer?: Buffer;
                fileBase64?: string;
                mimeType?: string;
                size?: number;
            }> = [];

            // 1. Scan local directory if folderPath is provided
            if (folderPath && typeof folderPath === 'string') {
                const resolvedPath = path.resolve(folderPath);
                console.log(`\n🔍 [Folder Upload] Scanning directory: "${resolvedPath}"`);
                if (!fs.existsSync(resolvedPath)) {
                    throw new Error(`Directory not found on server: ${folderPath}`);
                }
                const stat = fs.statSync(resolvedPath);
                if (!stat.isDirectory()) {
                    throw new Error(`Path is not a directory: ${folderPath}`);
                }

                const dirEntries = fs.readdirSync(resolvedPath);
                for (const entry of dirEntries) {
                    const fullPath = path.join(resolvedPath, entry);
                    try {
                        const fileStat = fs.statSync(fullPath);
                        if (fileStat.isFile() && isImageFilename(entry)) {
                            const buffer = fs.readFileSync(fullPath);
                            itemsToProcess.push({
                                filename: entry,
                                buffer,
                                mimeType: getMimeTypeFromFilename(entry),
                                size: buffer.length
                            });
                        }
                    } catch (readErr) {
                        console.warn(`Could not read file ${fullPath}:`, readErr);
                    }
                }
            }

            // 2. Add files provided in request (multipart form-data or JSON array)
            if (files && Array.isArray(files)) {
                for (const f of files) {
                    const originalName = f.originalname || f.filename || 'image.png';
                    const rawBase64 = f.file_base64 || f.fileBase64;
                    const buffer = f.buffer;
                    const mimeType = f.mimetype || f.mimeType || getMimeTypeFromFilename(originalName);

                    itemsToProcess.push({
                        filename: originalName,
                        buffer,
                        fileBase64: rawBase64,
                        mimeType,
                        size: buffer ? buffer.length : (f.size || 0)
                    });
                }
            }

            if (itemsToProcess.length === 0) {
                throw new Error('No valid image files found to upload.');
            }

            // Ensure output directory exists and initialize JSON file
            const outputDir = path.dirname(outputJsonPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            fs.writeFileSync(outputJsonPath, JSON.stringify([], null, 2), 'utf-8');

            console.log(`\n========================================================`);
            console.log(`🚀 [Folder Upload] Found ${itemsToProcess.length} images to process`);
            console.log(`📁 Target B2 Folder : "${folder}"`);
            console.log(`⏱️ Expiry Duration  : ${expiresIn} seconds (~${Math.round(expiresIn / 86400)} days)`);
            console.log(`📝 Output JSON File : ${outputJsonPath}`);
            console.log(`========================================================`);

            const results: UploadFolderItemResult[] = [];
            let uploadedCount = 0;
            let failedCount = 0;

            // 3. Process each image ONE BY ONE: convert to Base64, upload to B2, push to JSON file
            for (let i = 0; i < itemsToProcess.length; i++) {
                const item = itemsToProcess[i];
                const indexTag = `[${i + 1}/${itemsToProcess.length}]`;
                console.log(`\n➡️  ${indexTag} Processing: "${item.filename}"`);

                try {
                    let base64String = item.fileBase64;
                    let itemBuffer = item.buffer;

                    // Convert to Base64 if buffer exists
                    if (!base64String && itemBuffer) {
                        base64String = itemBuffer.toString('base64');
                        const kbSize = (itemBuffer.length / 1024).toFixed(2);
                        console.log(`   ⚙️  ${indexTag} Converted "${item.filename}" to Base64 (${kbSize} KB)`);
                    } else if (base64String && !itemBuffer) {
                        const clean = base64String.replace(/^data:[^;]+;base64,/, '');
                        itemBuffer = Buffer.from(clean, 'base64');
                    }

                    if (!base64String) {
                        throw new Error(`Unable to obtain Base64 data for ${item.filename}`);
                    }

                    const mimeType = item.mimeType || getMimeTypeFromFilename(item.filename);

                    console.log(`   ☁️  ${indexTag} Uploading "${item.filename}" to Backblaze B2...`);
                    // Upload Base64 to Backblaze B2
                    const uploadResult = await this.uploadBase64({
                        fileBase64: base64String,
                        filename: item.filename,
                        mimeType,
                        folder,
                        expiresIn,
                        bucket
                    });

                    if (!uploadResult.success) {
                        failedCount++;
                        console.error(`   ❌ ${indexTag} Upload failed for "${item.filename}":`, uploadResult.error);
                        const failedItem: UploadFolderItemResult = {
                            filename: item.filename,
                            mime_type: mimeType,
                            size: itemBuffer ? itemBuffer.length : (item.size || 0),
                            success: false,
                            error: uploadResult.error
                        };
                        results.push(failedItem);

                        // Push immediately to JSON file on disk
                        fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), 'utf-8');
                        continue;
                    }

                    uploadedCount++;
                    const itemResult: UploadFolderItemResult = {
                        filename: item.filename,
                        object_key: uploadResult.object_key,
                        file_url: uploadResult.file_url,
                        mime_type: uploadResult.content_type || mimeType,
                        size: uploadResult.size || (itemBuffer ? itemBuffer.length : 0),
                        expires_in: uploadResult.expires_in,
                        success: true
                    };

                    if (includeBase64) {
                        itemResult.file_base64 = base64String;
                    }

                    results.push(itemResult);

                    // Push immediately one by one to JSON file on disk
                    fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), 'utf-8');

                    console.log(`   ✅ ${indexTag} Uploaded successfully!`);
                    console.log(`      🔑 Object Key: ${uploadResult.object_key}`);
                    console.log(`      🔗 File URL  : ${uploadResult.file_url}`);
                    console.log(`      💾 Pushed to JSON file (${results.length} total saved so far)`);
                } catch (itemErr: any) {
                    failedCount++;
                    console.error(`   ❌ ${indexTag} Error processing "${item.filename}":`, itemErr?.message || itemErr);
                    const failedItem: UploadFolderItemResult = {
                        filename: item.filename,
                        success: false,
                        error: itemErr?.message || String(itemErr)
                    };
                    results.push(failedItem);

                    // Push immediately to JSON file on disk
                    fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), 'utf-8');
                }
            }

            console.log(`\n========================================================`);
            console.log(`🏁 [Folder Upload] Summary:`);
            console.log(`   ✅ Uploaded : ${uploadedCount}/${itemsToProcess.length}`);
            console.log(`   ❌ Failed   : ${failedCount}/${itemsToProcess.length}`);
            console.log(`   📄 JSON File: ${outputJsonPath}`);
            console.log(`========================================================\n`);

            return {
                folder,
                total_files: itemsToProcess.length,
                uploaded_count: uploadedCount,
                failed_count: failedCount,
                json_file: outputJsonPath,
                files: results
            };
        } catch (err) {
            console.error("FileUploadService.uploadFolder error ====>", err);
            throw err;
        }
    }

    /**
     * Get a presigned download URL for an existing file
     */
    async getPresignedDownloadUrl(objectKey: string, expiresIn = 3600, bucket?: string): Promise<string> {
        try {
            return await this.storage.getPresignedDownloadUrl(objectKey, expiresIn, bucket);
        } catch (err) {
            console.error("FileUploadService.getPresignedDownloadUrl error ====>", err);
            throw err;
        }
    }

    /**
     * Get a presigned upload URL for direct client uploads
     */
    async getPresignedUploadUrl(options: PresignedUploadOptions) {
        try {
            return await this.storage.getPresignedUploadUrl(options);
        } catch (err) {
            console.error("FileUploadService.getPresignedUploadUrl error ====>", err);
            throw err;
        }
    }

    /**
     * Get a fresh signed download URL for an object key whenever required
     */
    async getFreshUrl(objectKey: string, expiresIn = 3600, bucket?: string) {
        try {
            return await this.storage.getFreshUrl(objectKey, expiresIn, bucket);
        } catch (err) {
            console.error("FileUploadService.getFreshUrl error ====>", err);
            throw err;
        }
    }

    /**
     * Get fresh signed download URLs for multiple object keys in batch
     */
    async getFreshUrls(objectKeys: string[], expiresIn = 3600, bucket?: string) {
        try {
            return await this.storage.getFreshUrls(objectKeys, expiresIn, bucket);
        } catch (err) {
            console.error("FileUploadService.getFreshUrls error ====>", err);
            throw err;
        }
    }

    /**
     * Delete an object from Backblaze B2
     */
    async deleteFile(objectKey: string, bucket?: string) {
        try {
            return await this.storage.deleteObject(objectKey, bucket);
        } catch (err) {
            console.error("FileUploadService.deleteFile error ====>", err);
            throw err;
        }
    }

    /**
     * Check if a file record's signed URL is expired or expiring within 1 hour.
     * If so, calls getFreshUrl to generate a fresh B2 URL and updates the record in MongoDB.
     */
    async refreshFileUrlIfExpiringSoon(doc: any): Promise<any> {
        if (!doc || !doc.object_key) {
            return doc;
        }

        const now = Date.now();
        const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in ms

        let expiresAtTime: number;
        if (doc.expires_at) {
            expiresAtTime = new Date(doc.expires_at).getTime();
        } else if (doc.created_at && doc.expires_in) {
            expiresAtTime = new Date(doc.created_at).getTime() + (Number(doc.expires_in) * 1000);
        } else {
            expiresAtTime = now;
        }

        // If expires_at is less than 1 hour away from current time (or already expired)
        if (expiresAtTime - now < ONE_HOUR_MS) {
            console.log(`\n🔄 [Auto-Refresh] File "${doc.filename || doc.object_key}" URL is expiring within 1 hour or expired.`);
            console.log(`   Calling getFreshUrl for object_key: ${doc.object_key}...`);

            const expiresIn = doc.expires_in && Number(doc.expires_in) > 3600
                ? Number(doc.expires_in)
                : 2592000; // 30 days default

            const freshUrlResult = await this.getFreshUrl(doc.object_key, expiresIn);

            if (freshUrlResult && freshUrlResult.success && freshUrlResult.file_url) {
                const newExpiresAt = new Date(now + expiresIn * 1000);

                // Update MongoDB record in file_upload collection
                await FileUpload.findOneAndUpdate(
                    { id: doc.id },
                    {
                        $set: {
                            file_url: freshUrlResult.file_url,
                            expires_at: newExpiresAt,
                            expires_in: expiresIn,
                            updatedAt: new Date()
                        }
                    }
                );

                console.log(`   ✅ [Auto-Refresh] Updated MongoDB record ID ${doc.id} with fresh signed URL.`);
                console.log(`   🔗 New URL: ${freshUrlResult.file_url}`);
                console.log(`   ⏱️ New expires_at: ${newExpiresAt.toISOString()}\n`);

                doc.file_url = freshUrlResult.file_url;
                doc.expires_at = newExpiresAt;
                doc.expires_in = expiresIn;
            } else {
                console.warn(`   ⚠️ [Auto-Refresh] Failed to refresh URL for ${doc.object_key}:`, freshUrlResult?.error);
            }
        }

        return doc;
    }

    /**
     * Create single file record in file_upload collection
     */
    async createRecord(data: any) {
        try {
            return await CreateFileUpload(data);
        } catch (err) {
            console.error("FileUploadService.createRecord error ====>", err);
            throw err;
        }
    }

    /**
     * Bulk create file records in file_upload collection
     */
    async bulkCreateRecords(dataArray: any[]) {
        try {
            return await BulkCreateFileUpload(dataArray);
        } catch (err) {
            console.error("FileUploadService.bulkCreateRecords error ====>", err);
            throw err;
        }
    }

    /**
     * Get single file record by query, auto-refreshing URL if expiring within 1 hour
     */
    async getRecord(query: any) {
        try {
            let doc = await GetFileUpload(query);
            if (doc) {
                doc = await this.refreshFileUrlIfExpiringSoon(doc);
            }
            return doc;
        } catch (err) {
            console.error("FileUploadService.getRecord error ====>", err);
            throw err;
        }
    }

    /**
     * List file records with pagination and filters, auto-refreshing URLs if expiring within 1 hour
     */
    async listRecords(query: any, per_page: number, page_no: number, sort: any) {
        try {
            const result = await ListFileUpload(query, per_page, page_no, sort);
            if (result && Array.isArray(result.resp)) {
                result.resp = await Promise.all(
                    result.resp.map((doc: any) => this.refreshFileUrlIfExpiringSoon(doc))
                );
            }
            return result;
        } catch (err) {
            console.error("FileUploadService.listRecords error ====>", err);
            throw err;
        }
    }

    /**
     * Update file record by query
     */
    async updateRecord(query: any, data: any) {
        try {
            return await UpdateFileUpload(query, data);
        } catch (err) {
            console.error("FileUploadService.updateRecord error ====>", err);
            throw err;
        }
    }

    /**
     * Delete file record by query
     */
    async deleteRecord(query: any) {
        try {
            return await DeleteFileUpload(query);
        } catch (err) {
            console.error("FileUploadService.deleteRecord error ====>", err);
            throw err;
        }
    }

    /**
     * Upsert file record matching query
     */
    async upsertRecord(query: any, data: any) {
        try {
            return await UpsertFileUpload(query, data);
        } catch (err) {
            console.error("FileUploadService.upsertRecord error ====>", err);
            throw err;
        }
    }
}

export default FileUploadService;
