import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'node:path';
import crypto from 'node:crypto';

export interface B2StorageConfig {
  endpoint?: string;
  keyId?: string;
  applicationKey?: string;
  region?: string;
  bucket?: string;
  forcePathStyle?: boolean;
}

export interface UploadBase64Options {
  fileBase64: string;
  filename: string;
  mimeType?: string;
  folder?: string;
  expiresIn?: number;
  bucket?: string;
  metadata?: Record<string, string>;
}

export interface UploadBufferOptions {
  buffer: Buffer | Uint8Array;
  filename: string;
  mimeType?: string;
  folder?: string;
  expiresIn?: number;
  bucket?: string;
  metadata?: Record<string, string>;
}

export interface PresignedUploadOptions {
  filename: string;
  mimeType?: string;
  folder?: string;
  expiresIn?: number;
  bucket?: string;
}

export interface B2UploadSuccess {
  success: true;
  filename: string;
  object_key: string;
  file_url: string;
  expires_in: number;
  size?: number;
  content_type?: string;
}

export interface B2UploadError {
  success: false;
  error: string;
}

export type B2UploadResult = B2UploadSuccess | B2UploadError;

export class B2StorageService {
  private client: S3Client | null = null;
  private config: B2StorageConfig;

  constructor(config: B2StorageConfig = {}) {
    this.config = { ...config };
  }

  /**
   * Resolve environment config dynamically with fallbacks
   */
  private resolveConfig(): Required<B2StorageConfig> {
    const endpoint =
      this.config.endpoint ||
      process.env.B2_ENDPOINT ||
      'https://s3.us-east-005.backblazeb2.com';

    const keyId =
      this.config.keyId ||
      process.env.B2_KEY_ID ||
      process.env.B2_ACCESS_KEY_ID ||
      process.env.B2_APPLICATION_KEY_ID ||
      '';

    const applicationKey =
      this.config.applicationKey ||
      process.env.B2_APPLICATION_KEY ||
      process.env.B2_SECRET_ACCESS_KEY ||
      process.env.B2_SECRET_KEY ||
      '';

    const region =
      this.config.region ||
      process.env.B2_REGION ||
      'us-east-005';

    const bucket =
      this.config.bucket ||
      process.env.B2_BUCKET ||
      process.env.B2_BUCKET_NAME ||
      '';

    const forcePathStyle =
      typeof this.config.forcePathStyle === 'boolean'
        ? this.config.forcePathStyle
        : true;

    return {
      endpoint,
      keyId,
      applicationKey,
      region,
      bucket,
      forcePathStyle,
    };
  }

  /**
   * Lazily get or initialize the S3Client configured for Backblaze B2
   */
  public getClient(): S3Client {
    if (!this.client) {
      const resolved = this.resolveConfig();

      const clientConfig: S3ClientConfig = {
        endpoint: resolved.endpoint,
        region: resolved.region,
        credentials: {
          accessKeyId: resolved.keyId,
          secretAccessKey: resolved.applicationKey,
        },
        forcePathStyle: resolved.forcePathStyle,
      };

      this.client = new S3Client(clientConfig);
    }
    return this.client;
  }

  /**
   * Get default or target bucket name
   */
  public getBucket(overrideBucket?: string): string {
    const bucket = overrideBucket || this.resolveConfig().bucket;
    if (!bucket) {
      throw new Error(
        'B2 Bucket name is not configured. Please set B2_BUCKET environment variable or pass bucket option.'
      );
    }
    return bucket;
  }

  /**
   * Upload base64 encoded data to Backblaze B2 and return a presigned download URL
   * Matches the behavior and response format of the Python implementation.
   */
  public async uploadBase64(options: UploadBase64Options): Promise<B2UploadResult> {
    try {
      let { fileBase64, filename, mimeType, folder = 'uploads', expiresIn = 3600, bucket, metadata } = options;

      if (!fileBase64 || typeof fileBase64 !== 'string') {
        throw new Error('file_base64 must be a non-empty string');
      }

      if (!filename || typeof filename !== 'string') {
        throw new Error('filename must be a valid string');
      }

      // Remove Base64 data URI prefix if present (e.g., "data:image/png;base64,iVBORw0...")
      let cleanBase64 = fileBase64;
      let detectedMime = mimeType;

      if (cleanBase64.includes(',') && cleanBase64.startsWith('data:')) {
        const parts = cleanBase64.split(',', 2);
        const metaPart = parts[0];
        cleanBase64 = parts[1];

        if (!detectedMime) {
          const match = metaPart.match(/data:([^;]+)/);
          if (match && match[1]) {
            detectedMime = match[1];
          }
        }
      }

      // Remove any whitespace or newline characters from the base64 string
      cleanBase64 = cleanBase64.replace(/\s/g, '');

      // Decode Base64 to Buffer
      const fileData = Buffer.from(cleanBase64, 'base64');

      // Generate unique object key (uploads/<uuid><extension>)
      const extension = path.extname(filename);
      const uniqueId = crypto.randomUUID();
      const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
      const objectKey = cleanFolder ? `${cleanFolder}/${uniqueId}${extension}` : `${uniqueId}${extension}`;

      const targetBucket = this.getBucket(bucket);
      const client = this.getClient();

      // Upload to Backblaze B2
      const putCommand = new PutObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
        Body: fileData,
        ContentType: detectedMime || 'application/octet-stream',
        ...(metadata ? { Metadata: metadata } : {}),
      });

      await client.send(putCommand);

      // Generate presigned GET URL
      const getCommand = new GetObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
      });

      const fileUrl = await getSignedUrl(client, getCommand, { expiresIn });

      return {
        success: true,
        filename,
        object_key: objectKey,
        file_url: fileUrl,
        expires_in: expiresIn,
        size: fileData.length,
        content_type: detectedMime || 'application/octet-stream',
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || String(e),
      };
    }
  }

  /**
   * Upload binary buffer to Backblaze B2 and return a presigned download URL
   */
  public async uploadBuffer(options: UploadBufferOptions): Promise<B2UploadResult> {
    try {
      const { buffer, filename, mimeType, folder = 'uploads', expiresIn = 3600, bucket, metadata } = options;

      if (!buffer) {
        throw new Error('buffer must be provided');
      }

      if (!filename || typeof filename !== 'string') {
        throw new Error('filename must be a valid string');
      }

      const extension = path.extname(filename);
      const uniqueId = crypto.randomUUID();
      const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
      const objectKey = cleanFolder ? `${cleanFolder}/${uniqueId}${extension}` : `${uniqueId}${extension}`;

      const targetBucket = this.getBucket(bucket);
      const client = this.getClient();

      const putCommand = new PutObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
        Body: buffer,
        ContentType: mimeType || 'application/octet-stream',
        ...(metadata ? { Metadata: metadata } : {}),
      });

      await client.send(putCommand);

      const getCommand = new GetObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
      });

      const fileUrl = await getSignedUrl(client, getCommand, { expiresIn });

      return {
        success: true,
        filename,
        object_key: objectKey,
        file_url: fileUrl,
        expires_in: expiresIn,
        size: buffer.length,
        content_type: mimeType || 'application/octet-stream',
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || String(e),
      };
    }
  }

  /**
   * Clamp expiration time to valid S3 SigV4 limits (1 second to 7 days = 604800s)
   */
  public clampExpiresIn(expiresIn: number): number {
    return Math.min(Math.max(1, Math.floor(expiresIn)), 604800);
  }

  /**
   * Generate a presigned download URL for an existing object
   */
  public async getPresignedDownloadUrl(
    objectKey: string,
    expiresIn = 3600,
    bucket?: string
  ): Promise<string> {
    const targetBucket = this.getBucket(bucket);
    const client = this.getClient();
    const safeExpiresIn = this.clampExpiresIn(expiresIn);

    const getCommand = new GetObjectCommand({
      Bucket: targetBucket,
      Key: objectKey,
    });

    return await getSignedUrl(client, getCommand, { expiresIn: safeExpiresIn });
  }

  /**
   * Generate a fresh signed URL for an object key whenever required.
   * Clamps expiresIn up to the maximum 7 days (604800s).
   */
  public async getFreshUrl(
    objectKey: string,
    expiresIn = 3600,
    bucket?: string
  ): Promise<{
    success: boolean;
    object_key: string;
    file_url?: string;
    expires_in?: number;
    error?: string;
  }> {
    try {
      if (!objectKey || typeof objectKey !== 'string') {
        throw new Error('object_key must be a valid string');
      }

      const safeExpiresIn = this.clampExpiresIn(expiresIn);
      const fileUrl = await this.getPresignedDownloadUrl(objectKey, safeExpiresIn, bucket);

      return {
        success: true,
        object_key: objectKey,
        file_url: fileUrl,
        expires_in: safeExpiresIn,
      };
    } catch (e: any) {
      return {
        success: false,
        object_key: objectKey,
        error: e?.message || String(e),
      };
    }
  }

  /**
   * Generate fresh signed URLs for multiple object keys in batch.
   */
  public async getFreshUrls(
    objectKeys: string[],
    expiresIn = 3600,
    bucket?: string
  ): Promise<Array<{
    success: boolean;
    object_key: string;
    file_url?: string;
    expires_in?: number;
    error?: string;
  }>> {
    if (!Array.isArray(objectKeys)) {
      return [];
    }

    const safeExpiresIn = this.clampExpiresIn(expiresIn);

    return await Promise.all(
      objectKeys.map(async (key) => {
        return await this.getFreshUrl(key, safeExpiresIn, bucket);
      })
    );
  }

  /**
   * Generate a presigned PUT URL for client-direct uploads to B2
   */
  public async getPresignedUploadUrl(options: PresignedUploadOptions): Promise<{
    object_key: string;
    upload_url: string;
    expires_in: number;
  }> {
    const { filename, mimeType, folder = 'uploads', expiresIn = 3600, bucket } = options;
    const extension = path.extname(filename);
    const uniqueId = crypto.randomUUID();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const objectKey = cleanFolder ? `${cleanFolder}/${uniqueId}${extension}` : `${uniqueId}${extension}`;

    const targetBucket = this.getBucket(bucket);
    const client = this.getClient();

    const putCommand = new PutObjectCommand({
      Bucket: targetBucket,
      Key: objectKey,
      ContentType: mimeType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(client, putCommand, { expiresIn });

    return {
      object_key: objectKey,
      upload_url: uploadUrl,
      expires_in: expiresIn,
    };
  }

  /**
   * Delete an object from Backblaze B2
   */
  public async deleteObject(
    objectKey: string,
    bucket?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const targetBucket = this.getBucket(bucket);
      const client = this.getClient();

      const deleteCommand = new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
      });

      await client.send(deleteCommand);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Retrieve metadata / header of an object
   */
  public async getObjectMetadata(objectKey: string, bucket?: string): Promise<any> {
    const targetBucket = this.getBucket(bucket);
    const client = this.getClient();

    const headCommand = new HeadObjectCommand({
      Bucket: targetBucket,
      Key: objectKey,
    });

    return await client.send(headCommand);
  }
}

/**
 * Default singleton instance
 */
export const b2Storage = new B2StorageService();

/**
 * Functional drop-in equivalent of the Python `upload_base64_to_b2` function
 *
 * @param file_base64 Base64 string or Data URI of the file
 * @param filename Original filename with extension (e.g. "report.pdf")
 * @param mime_type MIME type (e.g. "application/pdf")
 * @param options Optional overrides (folder, expiresIn, bucket, metadata)
 */
export async function uploadBase64ToB2(
  file_base64: string,
  filename: string,
  mime_type?: string,
  options?: Partial<Omit<UploadBase64Options, 'fileBase64' | 'filename' | 'mimeType'>>
): Promise<B2UploadResult> {
  return await b2Storage.uploadBase64({
    fileBase64: file_base64,
    filename,
    mimeType: mime_type,
    folder: options?.folder || 'uploads',
    expiresIn: options?.expiresIn ?? 3600,
    bucket: options?.bucket,
    metadata: options?.metadata,
  });
}

/**
 * Generate a fresh signed URL for an existing object key whenever required.
 *
 * @param objectKey Object key stored in the database (e.g. "uploads/uuid.png")
 * @param expiresIn Expiration in seconds (default 3600, max 604800 / 7 days)
 * @param bucket Optional bucket name override
 */
export async function getFreshUrl(
  objectKey: string,
  expiresIn?: number,
  bucket?: string
) {
  return await b2Storage.getFreshUrl(objectKey, expiresIn, bucket);
}

/**
 * Generate fresh signed URLs for a list of object keys in batch.
 *
 * @param objectKeys Array of object keys
 * @param expiresIn Expiration in seconds (default 3600, max 604800 / 7 days)
 * @param bucket Optional bucket name override
 */
export async function getFreshUrls(
  objectKeys: string[],
  expiresIn?: number,
  bucket?: string
) {
  return await b2Storage.getFreshUrls(objectKeys, expiresIn, bucket);
}

