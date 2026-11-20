// apps/backend_service/src/main.ts
import express15 from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import axios2 from "axios";

// apps/backend_service/src/router.ts
import express14 from "express";

// apps/backend_service/src/controllers/project/router.ts
import express from "express";

// libs/shared-utils/src/lib/db_connectors/mongo_connector.ts
import mongoose from "mongoose";
var mongooseOptions = {
  serverSelectionTimeoutMS: 2e4,
  // Increased timeout
  socketTimeoutMS: 45e3,
  family: 4
  // Use IPv4, skip trying IPv6
};
var connectWithRetry = async (MONGODB_URI) => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  console.log("MONGODB_URI", MONGODB_URI);
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log("Successfully connected to MongoDB.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(() => connectWithRetry(MONGODB_URI), 5e3);
  }
};

// libs/shared-utils/src/lib/helpers/generate_random_alphanumeric.ts
async function generateRandomAlphanumeric(max_digits) {
  console.log("Generating random alphanumeric string1111111111");
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < max_digits; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// libs/shared-utils/src/lib/helpers/notification_middleware.ts
import axios from "axios";

// libs/shared-utils/src/lib/helpers/email_service.ts
import nodemailer from "nodemailer";

// libs/shared-utils/src/lib/helpers/b2_storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "node:path";
import crypto from "node:crypto";
var B2StorageService = class {
  client = null;
  config;
  constructor(config = {}) {
    this.config = { ...config };
  }
  /**
   * Resolve environment config dynamically with fallbacks
   */
  resolveConfig() {
    const endpoint = this.config.endpoint || process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com";
    const keyId = this.config.keyId || process.env.B2_KEY_ID || process.env.B2_ACCESS_KEY_ID || process.env.B2_APPLICATION_KEY_ID || "";
    const applicationKey = this.config.applicationKey || process.env.B2_APPLICATION_KEY || process.env.B2_SECRET_ACCESS_KEY || process.env.B2_SECRET_KEY || "";
    const region = this.config.region || process.env.B2_REGION || "us-east-005";
    const bucket = this.config.bucket || process.env.B2_BUCKET || process.env.B2_BUCKET_NAME || "";
    const forcePathStyle = typeof this.config.forcePathStyle === "boolean" ? this.config.forcePathStyle : true;
    return {
      endpoint,
      keyId,
      applicationKey,
      region,
      bucket,
      forcePathStyle
    };
  }
  /**
   * Lazily get or initialize the S3Client configured for Backblaze B2
   */
  getClient() {
    if (!this.client) {
      const resolved = this.resolveConfig();
      const clientConfig = {
        endpoint: resolved.endpoint,
        region: resolved.region,
        credentials: {
          accessKeyId: resolved.keyId,
          secretAccessKey: resolved.applicationKey
        },
        forcePathStyle: resolved.forcePathStyle
      };
      this.client = new S3Client(clientConfig);
    }
    return this.client;
  }
  /**
   * Get default or target bucket name
   */
  getBucket(overrideBucket) {
    const bucket = overrideBucket || this.resolveConfig().bucket;
    if (!bucket) {
      throw new Error(
        "B2 Bucket name is not configured. Please set B2_BUCKET environment variable or pass bucket option."
      );
    }
    return bucket;
  }
  /**
   * Upload base64 encoded data to Backblaze B2 and return a presigned download URL
   * Matches the behavior and response format of the Python implementation.
   */
  async uploadBase64(options) {
    try {
      let { fileBase64, filename, mimeType, folder = "uploads", expiresIn = 3600, bucket, metadata } = options;
      if (!fileBase64 || typeof fileBase64 !== "string") {
        throw new Error("file_base64 must be a non-empty string");
      }
      if (!filename || typeof filename !== "string") {
        throw new Error("filename must be a valid string");
      }
      let cleanBase64 = fileBase64;
      let detectedMime = mimeType;
      if (cleanBase64.includes(",") && cleanBase64.startsWith("data:")) {
        const parts = cleanBase64.split(",", 2);
        const metaPart = parts[0];
        cleanBase64 = parts[1];
        if (!detectedMime) {
          const match = metaPart.match(/data:([^;]+)/);
          if (match && match[1]) {
            detectedMime = match[1];
          }
        }
      }
      cleanBase64 = cleanBase64.replace(/\s/g, "");
      const fileData = Buffer.from(cleanBase64, "base64");
      const extension = path.extname(filename);
      const uniqueId = crypto.randomUUID();
      const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
      const objectKey = cleanFolder ? `${cleanFolder}/${uniqueId}${extension}` : `${uniqueId}${extension}`;
      const targetBucket = this.getBucket(bucket);
      const client = this.getClient();
      const putCommand = new PutObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
        Body: fileData,
        ContentType: detectedMime || "application/octet-stream",
        ...metadata ? { Metadata: metadata } : {}
      });
      await client.send(putCommand);
      const getCommand = new GetObjectCommand({
        Bucket: targetBucket,
        Key: objectKey
      });
      const fileUrl = await getSignedUrl(client, getCommand, { expiresIn });
      return {
        success: true,
        filename,
        object_key: objectKey,
        file_url: fileUrl,
        expires_in: expiresIn,
        size: fileData.length,
        content_type: detectedMime || "application/octet-stream"
      };
    } catch (e) {
      return {
        success: false,
        error: e?.message || String(e)
      };
    }
  }
  /**
   * Upload binary buffer to Backblaze B2 and return a presigned download URL
   */
  async uploadBuffer(options) {
    try {
      const { buffer, filename, mimeType, folder = "uploads", expiresIn = 3600, bucket, metadata } = options;
      if (!buffer) {
        throw new Error("buffer must be provided");
      }
      if (!filename || typeof filename !== "string") {
        throw new Error("filename must be a valid string");
      }
      const extension = path.extname(filename);
      const uniqueId = crypto.randomUUID();
      const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
      const objectKey = cleanFolder ? `${cleanFolder}/${uniqueId}${extension}` : `${uniqueId}${extension}`;
      const targetBucket = this.getBucket(bucket);
      const client = this.getClient();
      const putCommand = new PutObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
        Body: buffer,
        ContentType: mimeType || "application/octet-stream",
        ...metadata ? { Metadata: metadata } : {}
      });
      await client.send(putCommand);
      const getCommand = new GetObjectCommand({
        Bucket: targetBucket,
        Key: objectKey
      });
      const fileUrl = await getSignedUrl(client, getCommand, { expiresIn });
      return {
        success: true,
        filename,
        object_key: objectKey,
        file_url: fileUrl,
        expires_in: expiresIn,
        size: buffer.length,
        content_type: mimeType || "application/octet-stream"
      };
    } catch (e) {
      return {
        success: false,
        error: e?.message || String(e)
      };
    }
  }
  /**
   * Clamp expiration time to valid S3 SigV4 limits (1 second to 7 days = 604800s)
   */
  clampExpiresIn(expiresIn) {
    return Math.min(Math.max(1, Math.floor(expiresIn)), 604800);
  }
  /**
   * Generate a presigned download URL for an existing object
   */
  async getPresignedDownloadUrl(objectKey, expiresIn = 3600, bucket) {
    const targetBucket = this.getBucket(bucket);
    const client = this.getClient();
    const safeExpiresIn = this.clampExpiresIn(expiresIn);
    const getCommand = new GetObjectCommand({
      Bucket: targetBucket,
      Key: objectKey
    });
    return await getSignedUrl(client, getCommand, { expiresIn: safeExpiresIn });
  }
  /**
   * Generate a fresh signed URL for an object key whenever required.
   * Clamps expiresIn up to the maximum 7 days (604800s).
   */
  async getFreshUrl(objectKey, expiresIn = 3600, bucket) {
    try {
      if (!objectKey || typeof objectKey !== "string") {
        throw new Error("object_key must be a valid string");
      }
      const safeExpiresIn = this.clampExpiresIn(expiresIn);
      const fileUrl = await this.getPresignedDownloadUrl(objectKey, safeExpiresIn, bucket);
      return {
        success: true,
        object_key: objectKey,
        file_url: fileUrl,
        expires_in: safeExpiresIn
      };
    } catch (e) {
      return {
        success: false,
        object_key: objectKey,
        error: e?.message || String(e)
      };
    }
  }
  /**
   * Generate fresh signed URLs for multiple object keys in batch.
   */
  async getFreshUrls(objectKeys, expiresIn = 3600, bucket) {
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
  async getPresignedUploadUrl(options) {
    const { filename, mimeType, folder = "uploads", expiresIn = 3600, bucket } = options;
    const extension = path.extname(filename);
    const uniqueId = crypto.randomUUID();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
    const objectKey = cleanFolder ? `${cleanFolder}/${uniqueId}${extension}` : `${uniqueId}${extension}`;
    const targetBucket = this.getBucket(bucket);
    const client = this.getClient();
    const putCommand = new PutObjectCommand({
      Bucket: targetBucket,
      Key: objectKey,
      ContentType: mimeType || "application/octet-stream"
    });
    const uploadUrl = await getSignedUrl(client, putCommand, { expiresIn });
    return {
      object_key: objectKey,
      upload_url: uploadUrl,
      expires_in: expiresIn
    };
  }
  /**
   * Delete an object from Backblaze B2
   */
  async deleteObject(objectKey, bucket) {
    try {
      const targetBucket = this.getBucket(bucket);
      const client = this.getClient();
      const deleteCommand = new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: objectKey
      });
      await client.send(deleteCommand);
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message || String(e) };
    }
  }
  /**
   * Retrieve metadata / header of an object
   */
  async getObjectMetadata(objectKey, bucket) {
    const targetBucket = this.getBucket(bucket);
    const client = this.getClient();
    const headCommand = new HeadObjectCommand({
      Bucket: targetBucket,
      Key: objectKey
    });
    return await client.send(headCommand);
  }
};
var b2Storage = new B2StorageService();

// libs/shared-utils/src/lib/middleware/api_response_format.ts
var ApiResponseFormat = class {
  dataArr;
  data;
  constructor() {
    this.dataArr = [];
    this.data = {};
  }
  SUCCESS_RESP(data, message) {
    return {
      meta: {
        status: true,
        message: message || ""
      },
      data: data || this.data
    };
  }
  FAILURE_RESP(data, error_details, message) {
    return {
      meta: {
        status: false,
        message: message || ""
      },
      error: error_details || {
        name: "",
        message: ""
      }
    };
  }
  SUCCESS_RESP_WITH_PAGINATION(pagination, data, message) {
    return {
      meta: {
        status: true,
        message: message || "",
        pagination: pagination || {
          per_page: 0,
          page_no: 0,
          total_rows: 0,
          total_pages: 0
        }
      },
      data: data || this.dataArr
    };
  }
  SUCCESS_RESP_WITH_PAGINATION_AND_SUMMARY(pagination, data, summary, message) {
    return {
      meta: {
        status: true,
        message: message || "",
        pagination: pagination || {
          per_page: 0,
          page_no: 0,
          total_rows: 0,
          total_pages: 0
        },
        summary: summary || {
          total: 0,
          paymentPending: 0,
          reportGenerated: 0,
          completed: 0
        }
      },
      data: data || this.dataArr
    };
  }
};
var apiResponse = new ApiResponseFormat();

// libs/shared-utils/src/lib/middleware/jwt_token.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = "secret";
var JsonWebToken = class {
  sign(token) {
    return new Promise((resolve, reject) => {
      const options = { expiresIn: token.exp };
      jwt.sign(token.payload, JWT_SECRET, options, (err, encodedToken) => {
        if (err) {
          reject(err);
        } else {
          resolve(encodedToken);
        }
      });
    });
  }
  verify(jwtToken) {
    return new Promise((resolve, reject) => {
      jwt.verify(jwtToken, JWT_SECRET, (err, decoded) => {
        if (err) {
          resolve(false);
        } else {
          resolve(decoded);
        }
      });
    });
  }
  async checkExpiry(jwtToken) {
    const decodedToken = jwt.decode(jwtToken, { complete: true });
    if (!decodedToken?.payload?.exp) {
      return true;
    }
    const expirationTime = decodedToken.payload.exp;
    const currentTime = Math.floor(Date.now() / 1e3);
    return currentTime > expirationTime;
  }
};

// libs/shared-utils/src/lib/middleware/authentication.ts
var jwt_token = new JsonWebToken();
async function authentication(req, res, next) {
  const authToken = req.headers.authorization;
  try {
    if (!authToken) {
      return res.status(500).json(apiResponse.FAILURE_RESP({}, {
        name: "Invalid Authorization",
        message: "Invalid Authorization"
      }, "No authorization provided"));
    }
    const tokenArr = authToken.split(" ");
    if (tokenArr.length !== 2) {
      return res.status(500).json(apiResponse.FAILURE_RESP({}, {
        name: "Invalid Authorization",
        message: "Invalid Authorization"
      }, "No authorization provided"));
    }
    const token = tokenArr[1];
    const isExpired = await jwt_token.checkExpiry(token);
    if (isExpired) {
      return res.status(500).json(apiResponse.FAILURE_RESP({}, {
        name: "Token expired or not available",
        message: "Token expired or not available"
      }, "Token expired or not available"));
    }
    await jwt_token.verify(token);
    next();
  } catch (err) {
    console.log("Error ====>>>> ", err);
    next(err);
  }
}

// libs/shared-utils/src/lib/database/mongo_db/models/user.ts
import mongoose2 from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
var userSchemas = new mongoose2.Schema(
  {
    id: { type: Number, unique: true },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    user_name: { type: String, unique: true, sparse: true, default: "" },
    password: { type: String, default: "" },
    email: { type: String, default: "" },
    mobile_number: { type: String, default: "" },
    role: { type: Object, default: {} },
    profile_image: { type: String, default: "" },
    scellcare_id: { type: Number },
    pregen_id: { type: Number },
    transvidan_id: { type: Number },
    created_by_id: { type: Number },
    is_active: { type: Boolean }
  },
  { _id: true, timestamps: true }
);
userSchemas.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
userSchemas.index({ id: 1, createdAt: -1 });
userSchemas.plugin(mongoosePaginate);
var User = mongoose2.model("users", userSchemas, "users");

// libs/shared-utils/src/lib/database/mongo_db/models/project.ts
import mongoose3 from "mongoose";
var projectSchema = new mongoose3.Schema(
  {
    id: { type: Number, unique: true },
    project_name: { type: String },
    project_unique_id: { type: String },
    experimental_model: { type: String },
    test_drug: { type: String },
    reference_drug: { type: String },
    description: { type: String },
    module: { type: mongoose3.Schema.Types.Mixed },
    submodule: { type: mongoose3.Schema.Types.Mixed },
    modules: [{ type: mongoose3.Schema.Types.Mixed }],
    assigned_modules: [{ type: mongoose3.Schema.Types.Mixed }],
    status: { type: String, default: "new" },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true, strict: false }
);
projectSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
var Project = mongoose3.model("project", projectSchema);

// libs/shared-utils/src/lib/database/mongo_db/models/growth_factor_quantification.ts
import mongoose4 from "mongoose";
import mongoosePaginate2 from "mongoose-paginate-v2";
var laneResultSchema = new mongoose4.Schema(
  {
    lane_no: { type: Number },
    lane: { type: String },
    lane_category: { type: String },
    lane_group: { type: String },
    sample_label: { type: String },
    estimated_center_percentage: { type: String },
    status: { type: String, default: "active" },
    target_intensity: { type: Number },
    beta_actin_intensity: { type: Number },
    common_beta_actin_reference: { type: Number },
    normalized_expression: { type: Number },
    fold_change_vs_reference: { type: Number },
    rank: { type: Number },
    target_background: { type: Number },
    target_saturated_fraction: { type: Number },
    actin_saturated_fraction: { type: Number }
  },
  { _id: false }
);
var imageResultSchema = new mongoose4.Schema(
  {
    pair_number: { type: Number },
    category: { type: String },
    target_image: {
      filename: { type: String },
      original_image_base64: { type: String },
      processed_image_base64: { type: String }
    },
    actin_image: {
      filename: { type: String },
      original_image_base64: { type: String },
      processed_image_base64: { type: String }
    },
    results: [laneResultSchema],
    graphs: {
      target_intensity_graph_base64: { type: String },
      normalized_expression_graph_base64: { type: String },
      fold_change_graph_base64: { type: String }
    }
  },
  { _id: false }
);
var growthFactorQuantificationSchema = new mongoose4.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, required: true },
    message: { type: String, default: "Analysis completed." },
    success: { type: Boolean, default: true },
    number_of_image_pairs: { type: Number, default: 1 },
    no_of_layers: { type: Number, default: 4 },
    lane_order: { type: String, default: "Custom" },
    image_results: [imageResultSchema],
    is_active: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);
growthFactorQuantificationSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
growthFactorQuantificationSchema.index({ id: 1, createdAt: -1, category: 1 });
growthFactorQuantificationSchema.plugin(mongoosePaginate2);
var GrowthFactorQuantification = mongoose4.model(
  "growth_factor_quantification",
  growthFactorQuantificationSchema,
  "growth_factor_quantifications"
);

// libs/shared-utils/src/lib/database/mongo_db/models/nociception_assay.ts
import mongoose5 from "mongoose";
import mongoosePaginate3 from "mongoose-paginate-v2";
var qpcrMarkerCtDataSchema = new mongoose5.Schema(
  {
    target_ct: [{ type: Number }],
    beta_actin_ct: [{ type: Number }]
  },
  { _id: false }
);
var qpcrSampleSchema = new mongoose5.Schema(
  {
    sample_name: { type: String },
    markers: { type: mongoose5.Schema.Types.Mixed }
  },
  { _id: false }
);
var qpcrResultItemSchema = new mongoose5.Schema(
  {
    sample_name: { type: String },
    target_ct_average: { type: Number },
    target_ct_sd: { type: Number },
    beta_actin_ct_average: { type: Number },
    beta_actin_ct_sd: { type: Number },
    delta_ct: { type: Number },
    delta_ct_sd: { type: Number },
    delta_delta_ct: { type: Number },
    fold_change: { type: Number }
  },
  { _id: false }
);
var qpcrGraphItemSchema = new mongoose5.Schema(
  {
    mime_type: { type: String, default: "image/png" },
    encoding: { type: String, default: "base64" },
    image_base64: { type: String }
  },
  { _id: false }
);
var nociceptionAssaySchema = new mongoose5.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    assay_name: { type: String, default: "Nociception Assay" },
    category: { type: String, default: "mechanistic_analysis" },
    calculation_method: { type: String, default: "2^(-\u0394\u0394Ct)" },
    control_group: { type: String, default: "Vehicle control" },
    calibrator: { type: String, default: "Vehicle control" },
    groups: [{ type: String }],
    genes: [{ type: String }],
    markers: [{ type: String }],
    biological_replicates: [{ type: String }],
    formulas: { type: mongoose5.Schema.Types.Mixed, default: {} },
    cq_values: { type: mongoose5.Schema.Types.Mixed, default: {} },
    loading_control: [{ type: mongoose5.Schema.Types.Mixed }],
    dct_ddct_fold_change: [{ type: mongoose5.Schema.Types.Mixed }],
    biological_replicate_averages: [{ type: mongoose5.Schema.Types.Mixed }],
    final_result: [{ type: mongoose5.Schema.Types.Mixed }],
    results: { type: mongoose5.Schema.Types.Mixed, default: {} },
    graph: { type: mongoose5.Schema.Types.Mixed, default: {} },
    graphs: { type: mongoose5.Schema.Types.Mixed, default: {} },
    images: { type: mongoose5.Schema.Types.Mixed, default: {} },
    samples: [mongoose5.Schema.Types.Mixed],
    data: { type: mongoose5.Schema.Types.Mixed },
    meta: {
      status: { type: mongoose5.Schema.Types.Mixed, default: true },
      message: { type: String, default: "qPCR Analysis Completed Successfully" }
    },
    message: { type: String, default: "qPCR Analysis Completed Successfully" },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true, strict: false }
);
nociceptionAssaySchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
nociceptionAssaySchema.index({ id: 1, createdAt: -1, project_id: 1 });
nociceptionAssaySchema.plugin(mongoosePaginate3);
var NociceptionAssay = mongoose5.model(
  "nociception_assay",
  nociceptionAssaySchema,
  "nociception_assays"
);

// libs/shared-utils/src/lib/database/mongo_db/models/adventitious_agents.ts
import mongoose6 from "mongoose";
import mongoosePaginate4 from "mongoose-paginate-v2";
var sampleDetailsSchema = new mongoose6.Schema(
  {
    sample_id: { type: String },
    sample_type: { type: String },
    collection_point: { type: String },
    extraction_method: { type: String },
    internal_control_type: { type: String },
    internal_control_name: { type: String },
    extraction_control_status: { type: String }
  },
  { _id: false }
);
var internalControlRangeSchema = new mongoose6.Schema(
  {
    min_ct: { type: Number },
    max_ct: { type: Number }
  },
  { _id: false }
);
var assayConfigurationSchema = new mongoose6.Schema(
  {
    viral_agent: { type: String },
    assay: { type: String },
    positive_control_id: { type: String },
    cutoff: { type: Number },
    borderline_interval: { type: Number },
    lod: { type: mongoose6.Schema.Types.Mixed },
    max_accepted_ct: { type: Number },
    internal_control_range: internalControlRangeSchema,
    suggested_internal_control: { type: String }
  },
  { _id: false }
);
var viralInputSchema = new mongoose6.Schema(
  {
    viral_agent: { type: String },
    sample_ct: { type: Number },
    positive_control_ct: { type: Number },
    negative_control_ct: { type: Number },
    internal_control_ct: { type: Number }
  },
  { _id: false }
);
var sampleSchema = new mongoose6.Schema(
  {
    sample_id: { type: String },
    sample_type: { type: String },
    collection_point: { type: String },
    extraction_method: { type: String },
    viral_inputs: [viralInputSchema]
  },
  { _id: false }
);
var borderlineRangeSchema = new mongoose6.Schema(
  {
    lower_inclusive: { type: Number },
    upper_exclusive: { type: Number }
  },
  { _id: false }
);
var resultSchema = new mongoose6.Schema(
  {
    viral_agent: { type: String },
    assay: { type: String },
    positive_control_id: { type: String },
    sample_ct: { type: Number },
    sample_ct_status: { type: String },
    positive_control_ct: { type: Number },
    positive_control_status: { type: String },
    negative_control_ct: { type: Number },
    negative_control_status: { type: String },
    internal_control_ct: { type: Number },
    internal_control_status: { type: String },
    delta_ct_sample_minus_positive: { type: Number },
    cutoff: { type: Number },
    borderline_interval: { type: Number },
    borderline_range: borderlineRangeSchema,
    lod: { type: mongoose6.Schema.Types.Mixed },
    max_accepted_ct: { type: Number },
    internal_control_range: internalControlRangeSchema,
    run_validity: { type: String },
    internal_control_qc: { type: String },
    qc_status: { type: String },
    screening_result: { type: String },
    interpretation: { type: String },
    notes: [{ type: mongoose6.Schema.Types.Mixed }]
  },
  { _id: false }
);
var summarySchema = new mongoose6.Schema(
  {
    total_targets: { type: Number },
    not_detected: { type: Number },
    detected: { type: Number },
    inconclusive: { type: Number },
    invalid: { type: Number },
    overall_viral_screening_status: { type: String },
    assay_controls: { type: String },
    pcr_inhibition: { type: String },
    overall_safety_assessment: { type: String }
  },
  { _id: false }
);
var adventitiousAgentsSchema = new mongoose6.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "safety_assessment" },
    assay_type: { type: String, default: "qPCR / RT-qPCR" },
    calculation_method: { type: String, default: "Ct cutoff-based screening" },
    sample_details: sampleDetailsSchema,
    assay_configuration: [assayConfigurationSchema],
    samples: [sampleSchema],
    results: [resultSchema],
    summary: summarySchema,
    graphs: { type: mongoose6.Schema.Types.Mixed, default: {} },
    meta: {
      status: { type: mongoose6.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Adventitious Agents Analysis Completed Successfully" }
    },
    message: { type: String, default: "Adventitious Agents Analysis Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);
adventitiousAgentsSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
adventitiousAgentsSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
adventitiousAgentsSchema.plugin(mongoosePaginate4);
var AdventitiousAgents = mongoose6.model(
  "adventitious_agents",
  adventitiousAgentsSchema,
  "adventitious_agents"
);

// libs/shared-utils/src/lib/database/mongo_db/models/wound_healing.ts
import mongoose7 from "mongoose";
import mongoosePaginate5 from "mongoose-paginate-v2";
var imageItemSchema = new mongoose7.Schema(
  {
    image_id: { type: String },
    sample_group: { type: String },
    time_hours: { type: Number },
    filename: { type: String },
    mime_type: { type: String },
    encoding: { type: String },
    image_base64: { type: String },
    width: { type: Number },
    height: { type: Number },
    detected_format: { type: String }
  },
  { _id: false }
);
var woundHealingSchema = new mongoose7.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "efficacy_assessment" },
    analysis_type: { type: String, default: "microscopy_image_batch" },
    patient_id: { type: String },
    app_inputs: { type: mongoose7.Schema.Types.Mixed, default: {} },
    image_count: { type: Number },
    images: [imageItemSchema],
    results: { type: mongoose7.Schema.Types.Mixed, default: {} },
    graphs: { type: mongoose7.Schema.Types.Mixed, default: [] },
    output_images: { type: mongoose7.Schema.Types.Mixed, default: [] },
    data: { type: mongoose7.Schema.Types.Mixed },
    meta: {
      status: { type: mongoose7.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Wound Healing Analysis Completed Successfully" }
    },
    message: { type: String, default: "Wound Healing Analysis Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);
woundHealingSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
woundHealingSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
woundHealingSchema.plugin(mongoosePaginate5);
var WoundHealing = mongoose7.model(
  "wound_healing",
  woundHealingSchema,
  "wound_healings"
);

// libs/shared-utils/src/lib/database/mongo_db/models/induced_inflammation.ts
import mongoose8 from "mongoose";
import mongoosePaginate6 from "mongoose-paginate-v2";
var inducedInflammationSchema = new mongoose8.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "safety_assessment" },
    drug_name: { type: String },
    batch_no: { type: String },
    marker: { type: String },
    dilution_factor: { type: Number, default: 1 },
    subtract_blank: { type: Boolean, default: false },
    method: { type: String },
    test_drug_group: { type: String },
    reference_drug_group: { type: String },
    available_sample_groups: [{ type: String }],
    warnings: [{ type: mongoose8.Schema.Types.Mixed }],
    blank: { type: Number },
    n_blank: { type: Number },
    relative_potency: {
      value: { type: Number },
      unit: { type: String },
      method: { type: String }
    },
    standard_curve: {
      parameters: { type: mongoose8.Schema.Types.Mixed },
      table: [{ type: mongoose8.Schema.Types.Mixed }]
    },
    potency_curve: {
      parameters: { type: mongoose8.Schema.Types.Mixed },
      table: [{ type: mongoose8.Schema.Types.Mixed }]
    },
    samples: [{ type: mongoose8.Schema.Types.Mixed }],
    graphs: { type: mongoose8.Schema.Types.Mixed, default: {} },
    exports: { type: mongoose8.Schema.Types.Mixed, default: {} },
    uploaded_file: { type: mongoose8.Schema.Types.Mixed },
    message: { type: String },
    success: { type: Boolean },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);
inducedInflammationSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
inducedInflammationSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
inducedInflammationSchema.plugin(mongoosePaginate6);
var InducedInflammation = mongoose8.model(
  "induced_inflammation",
  inducedInflammationSchema,
  "induced_inflammations"
);

// libs/shared-utils/src/lib/database/mongo_db/models/mycoplasma_testing.ts
import mongoose9 from "mongoose";
import mongoosePaginate7 from "mongoose-paginate-v2";
var assayRulesSchema = new mongoose9.Schema(
  {
    cutoff: { type: Number, default: null },
    borderline: { type: Number, default: null },
    borderline_lower_limit: { type: Number, default: null },
    max_ct: { type: Number },
    internal_control_min: { type: Number },
    internal_control_max: { type: Number },
    positive_control_requirement: { type: String },
    negative_control_requirement: { type: String },
    extraction_blank_requirement: { type: String }
  },
  { _id: false }
);
var mycoplasmaSampleSchema = new mongoose9.Schema(
  {
    sample_id: { type: String },
    target_ct: { type: Number },
    internal_control_ct: { type: Number },
    positive_control_ct: { type: Number },
    negative_control_ct: { type: Number }
  },
  { _id: false }
);
var borderlineRangeSchema2 = new mongoose9.Schema(
  {
    lower_inclusive: { type: Number, default: null },
    upper_exclusive: { type: Number, default: null }
  },
  { _id: false }
);
var mycoplasmaResultSchema = new mongoose9.Schema(
  {
    sample_id: { type: String },
    target_ct: { type: Number },
    target_ct_status: { type: String },
    internal_control_ct: { type: Number },
    internal_control_status: { type: String },
    positive_control_ct: { type: Number },
    positive_control_status: { type: String },
    negative_control_ct: { type: Number },
    negative_control_status: { type: String },
    negative_control: { type: mongoose9.Schema.Types.Mixed },
    extraction_blank: { type: String },
    delta_ct_target_minus_positive_control: { type: Number, default: null },
    delta_ct_target_minus_negative_control: { type: Number, default: null },
    cutoff: { type: Number, default: null },
    borderline_range: borderlineRangeSchema2,
    screening_result: { type: String },
    interpretation: { type: String },
    qc_status: { type: String }
  },
  { _id: false }
);
var mycoplasmaTestingSchema = new mongoose9.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "safety_assessment" },
    assay_type: { type: String, default: "Mycoplasma_qPCR" },
    calculation_method: { type: String, default: "Target Ct vs negative control Ct" },
    assay_rules: assayRulesSchema,
    samples: [mycoplasmaSampleSchema],
    results: [mycoplasmaResultSchema],
    graphs: { type: mongoose9.Schema.Types.Mixed, default: {} },
    meta: {
      status: { type: mongoose9.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Mycoplasma Testing Completed Successfully" }
    },
    message: { type: String, default: "Mycoplasma Testing Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);
mycoplasmaTestingSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
mycoplasmaTestingSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
mycoplasmaTestingSchema.plugin(mongoosePaginate7);
var MycoplasmaTesting = mongoose9.model(
  "mycoplasma_testing",
  mycoplasmaTestingSchema,
  "mycoplasma_testings"
);

// libs/shared-utils/src/lib/database/mongo_db/models/barrier_integrity.ts
import mongoose10 from "mongoose";
import mongoosePaginate8 from "mongoose-paginate-v2";
var formulasSchema = new mongoose10.Schema(
  {
    mean: { type: String, default: "sum(TEER_i) / n" },
    sd: { type: String, default: "sqrt(sum((TEER_i - mean)^2) / (n - 1))" },
    percent_integrity: { type: String, default: "TEER_sample / TEER_healthy * 100" },
    percent_barrier_restoration: { type: String, default: "(TEER_treatment - TEER_disease) / (TEER_healthy - TEER_disease) * 100" }
  },
  { _id: false }
);
var barrierResultSchema = new mongoose10.Schema(
  {
    component_name: { type: String },
    group: { type: String },
    teer: [{ type: Number }],
    n: { type: Number },
    mean: { type: Number },
    sd: { type: Number },
    percent_integrity: { type: Number, default: null },
    percent_barrier_restoration: { type: Number, default: null }
  },
  { _id: false }
);
var barrierIntegritySchema = new mongoose10.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "efficacy_assessment" },
    assay_type: { type: String, default: "Transepithelial Electrical Resistance (TEER)" },
    formulas: { type: formulasSchema, default: () => ({}) },
    healthy_mean_teer: { type: Number, default: null },
    disease_mean_teer: { type: Number, default: null },
    results: [barrierResultSchema],
    warnings: [{ type: mongoose10.Schema.Types.Mixed }],
    graphs: { type: mongoose10.Schema.Types.Mixed, default: {} },
    data: { type: mongoose10.Schema.Types.Mixed },
    meta: {
      status: { type: mongoose10.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Barrier Integrity Analysis Completed Successfully" }
    },
    message: { type: String, default: "Barrier Integrity Analysis Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);
barrierIntegritySchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});
barrierIntegritySchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
barrierIntegritySchema.plugin(mongoosePaginate8);
var BarrierIntegrity = mongoose10.model(
  "barrier_integrity",
  barrierIntegritySchema,
  "barrier_integrities"
);

// libs/shared-utils/src/lib/database/mongo_db/models/file_upload.ts
import mongoose11 from "mongoose";
import mongoosePaginate9 from "mongoose-paginate-v2";
var fileUploadSchema = new mongoose11.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "general" },
    sub_category: { type: String },
    filename: { type: String, required: true },
    file_type: { type: String },
    mime_type: { type: String },
    object_key: { type: String, required: true },
    file_url: { type: String, required: true },
    expires_in: { type: Number, default: 2592e3 },
    size: { type: Number },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date },
    status: { type: String, default: "active" },
    is_active: { type: Boolean, default: true },
    metadata: { type: mongoose11.Schema.Types.Mixed, default: {} },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true, strict: false }
);
function detectFileType(filename, mimeType) {
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "spreadsheet";
  }
  if (filename) {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
    if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".tif", ".tiff", ".ico"].includes(ext)) {
      return "image";
    }
    if ([".mp4", ".mov", ".avi", ".mkv", ".webm"].includes(ext)) return "video";
    if ([".mp3", ".wav", ".ogg", ".m4a"].includes(ext)) return "audio";
    if (ext === ".pdf") return "pdf";
    if ([".xlsx", ".xls", ".csv"].includes(ext)) return "spreadsheet";
    if ([".doc", ".docx", ".txt", ".rtf"].includes(ext)) return "document";
  }
  return "file";
}
fileUploadSchema.pre("save", async function() {
  if (this.isNew && this.id == null) {
    const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
  if (!this.created_at) {
    this.created_at = /* @__PURE__ */ new Date();
  }
  if (!this.file_type) {
    this.file_type = detectFileType(this.filename, this.mime_type);
  }
  if (!this.expires_at && this.expires_in) {
    this.expires_at = new Date(this.created_at.getTime() + this.expires_in * 1e3);
  }
});
fileUploadSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1, sub_category: 1, object_key: 1, expires_at: 1 });
fileUploadSchema.plugin(mongoosePaginate9);
var FileUpload = mongoose11.model(
  "file_upload",
  fileUploadSchema,
  "file_upload"
);

// libs/shared-utils/src/lib/database/mongo_db/repository/common_repository.ts
var createDocument = async (model, data) => {
  return await model.create(data);
};
var updateDocument = async (model, query, data) => {
  return await model.findOneAndUpdate(query, { $set: data }, { new: true });
};
var deleteDocument = async (model, query) => {
  return await model.deleteOne(query);
};
var getOne = async (model, query, projection) => {
  return await model.findOne(query).select(projection || {}).lean();
};
var listDocuments = async (model, query, perPage, pageNo, sort, projection) => {
  if (perPage === -1) {
    return await model.find(query).select(projection || {}).sort(sort).lean();
  }
  return await model.find(query).select(projection || {}).sort(sort).skip((pageNo - 1) * perPage).limit(perPage).lean();
};
var getPagination = async (model, query, perPage, pageNo) => {
  if (perPage === -1) {
    const totalRecord2 = await model.countDocuments(query);
    return {
      per_page: perPage,
      page_no: pageNo,
      total_rows: totalRecord2,
      total_pages: 1
    };
  }
  const totalRecord = await model.countDocuments(query);
  const totalPages = Math.ceil(totalRecord / perPage);
  return {
    per_page: perPage,
    page_no: pageNo,
    total_rows: totalRecord,
    total_pages: totalPages
  };
};
var upsertDocument = async (model, query, data) => {
  return await model.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true });
};

// libs/shared-utils/src/lib/database/mongo_db/repository/growth_factor_quantification.ts
var buildGrowthFactorAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        message: "$message",
        success: "$success",
        number_of_image_pairs: "$number_of_image_pairs",
        no_of_layers: "$no_of_layers",
        lane_order: "$lane_order",
        image_results: "$image_results",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetGrowthFactorQuantification = async (query) => {
  const data = await GrowthFactorQuantification.aggregate(
    buildGrowthFactorAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListGrowthFactorQuantification = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const total_record = await GrowthFactorQuantification.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await GrowthFactorQuantification.aggregate(
      buildGrowthFactorAggregationPipeline(query, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await GrowthFactorQuantification.aggregate(
    buildGrowthFactorAggregationPipeline(query, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};

// libs/shared-utils/src/lib/database/mongo_db/repository/nociception_assay.ts
var buildNociceptionAssayAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  if (Array.isArray(normalizedQuery.$or)) {
    normalizedQuery.$or = normalizedQuery.$or.map((condition) => {
      const cond = { ...condition };
      if (cond.id !== void 0 && !isNaN(Number(cond.id))) {
        cond.id = Number(cond.id);
      }
      if (cond.project_id !== void 0 && !isNaN(Number(cond.project_id))) {
        cond.project_id = Number(cond.project_id);
      }
      return cond;
    });
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        assay_name: "$assay_name",
        category: "$category",
        calculation_method: "$calculation_method",
        control_group: { $ifNull: ["$control_group", "$calibrator"] },
        calibrator: { $ifNull: ["$calibrator", "$control_group"] },
        groups: "$groups",
        genes: { $ifNull: ["$genes", "$markers"] },
        markers: { $ifNull: ["$markers", "$genes"] },
        biological_replicates: "$biological_replicates",
        formulas: "$formulas",
        cq_values: "$cq_values",
        loading_control: "$loading_control",
        dct_ddct_fold_change: "$dct_ddct_fold_change",
        biological_replicate_averages: "$biological_replicate_averages",
        final_result: { $ifNull: ["$final_result", "$results"] },
        results: { $ifNull: ["$results", "$final_result"] },
        graph: { $ifNull: ["$graph", "$graphs"] },
        graphs: { $ifNull: ["$graphs", "$graph"] },
        images: { $ifNull: ["$images", { $ifNull: ["$graphs", "$graph"] }] },
        samples: "$samples",
        data: "$data",
        meta: "$meta",
        message: "$message",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetNociceptionAssay = async (query) => {
  const data = await NociceptionAssay.aggregate(
    buildNociceptionAssayAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListNociceptionAssay = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  if (Array.isArray(normalizedQuery.$or)) {
    normalizedQuery.$or = normalizedQuery.$or.map((condition) => {
      const cond = { ...condition };
      if (cond.id !== void 0 && !isNaN(Number(cond.id))) {
        cond.id = Number(cond.id);
      }
      if (cond.project_id !== void 0 && !isNaN(Number(cond.project_id))) {
        cond.project_id = Number(cond.project_id);
      }
      return cond;
    });
  }
  const total_record = await NociceptionAssay.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await NociceptionAssay.aggregate(
      buildNociceptionAssayAggregationPipeline(normalizedQuery, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await NociceptionAssay.aggregate(
    buildNociceptionAssayAggregationPipeline(normalizedQuery, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};
var UpsertNociceptionAssay = async (query, data) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  if (Array.isArray(normalizedQuery.$or)) {
    normalizedQuery.$or = normalizedQuery.$or.map((condition) => {
      const cond = { ...condition };
      if (cond.id !== void 0 && !isNaN(Number(cond.id))) {
        cond.id = Number(cond.id);
      }
      if (cond.project_id !== void 0 && !isNaN(Number(cond.project_id))) {
        cond.project_id = Number(cond.project_id);
      }
      return cond;
    });
  }
  const existing = await NociceptionAssay.findOne(normalizedQuery);
  if (!existing && (data.id == null || data.id === void 0)) {
    const latestDocument = await NociceptionAssay.findOne({}, {}, { sort: { id: -1 } });
    data.id = latestDocument ? latestDocument.id + 1 : 1;
  }
  return await NociceptionAssay.findOneAndUpdate(normalizedQuery, { $set: data }, { upsert: true, new: true });
};

// libs/shared-utils/src/lib/database/mongo_db/repository/adventitious_agents.ts
var buildAdventitiousAgentsAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        assay_type: "$assay_type",
        calculation_method: "$calculation_method",
        sample_details: "$sample_details",
        assay_configuration: "$assay_configuration",
        samples: "$samples",
        results: "$results",
        summary: "$summary",
        graphs: "$graphs",
        meta: "$meta",
        message: "$message",
        success: "$success",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetAdventitiousAgents = async (query) => {
  const data = await AdventitiousAgents.aggregate(
    buildAdventitiousAgentsAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListAdventitiousAgents = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const total_record = await AdventitiousAgents.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await AdventitiousAgents.aggregate(
      buildAdventitiousAgentsAggregationPipeline(query, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await AdventitiousAgents.aggregate(
    buildAdventitiousAgentsAggregationPipeline(query, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};

// libs/shared-utils/src/lib/database/mongo_db/repository/wound_healing.ts
var buildWoundHealingAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        analysis_type: "$analysis_type",
        patient_id: "$patient_id",
        app_inputs: "$app_inputs",
        image_count: "$image_count",
        images: "$images",
        results: "$results",
        graphs: "$graphs",
        output_images: "$output_images",
        data: "$data",
        meta: "$meta",
        message: "$message",
        success: "$success",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetWoundHealing = async (query) => {
  const data = await WoundHealing.aggregate(
    buildWoundHealingAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListWoundHealing = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const total_record = await WoundHealing.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await WoundHealing.aggregate(
      buildWoundHealingAggregationPipeline(query, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await WoundHealing.aggregate(
    buildWoundHealingAggregationPipeline(query, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};

// libs/shared-utils/src/lib/database/mongo_db/repository/induced_inflammation.ts
var buildInducedInflammationAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        drug_name: "$drug_name",
        batch_no: "$batch_no",
        marker: "$marker",
        dilution_factor: "$dilution_factor",
        subtract_blank: "$subtract_blank",
        method: "$method",
        test_drug_group: "$test_drug_group",
        reference_drug_group: "$reference_drug_group",
        available_sample_groups: "$available_sample_groups",
        warnings: "$warnings",
        blank: "$blank",
        n_blank: "$n_blank",
        relative_potency: "$relative_potency",
        standard_curve: "$standard_curve",
        potency_curve: "$potency_curve",
        samples: "$samples",
        graphs: "$graphs",
        exports: "$exports",
        uploaded_file: "$uploaded_file",
        meta: "$meta",
        message: "$message",
        success: "$success",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetInducedInflammation = async (query) => {
  const data = await InducedInflammation.aggregate(
    buildInducedInflammationAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListInducedInflammation = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const total_record = await InducedInflammation.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await InducedInflammation.aggregate(
      buildInducedInflammationAggregationPipeline(query, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await InducedInflammation.aggregate(
    buildInducedInflammationAggregationPipeline(query, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};

// libs/shared-utils/src/lib/database/mongo_db/repository/mycoplasma_testing.ts
var buildMycoplasmaTestingAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        assay_type: "$assay_type",
        calculation_method: "$calculation_method",
        assay_rules: "$assay_rules",
        samples: "$samples",
        results: "$results",
        graphs: "$graphs",
        meta: "$meta",
        message: "$message",
        success: "$success",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetMycoplasmaTesting = async (query) => {
  const data = await MycoplasmaTesting.aggregate(
    buildMycoplasmaTestingAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListMycoplasmaTesting = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const total_record = await MycoplasmaTesting.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await MycoplasmaTesting.aggregate(
      buildMycoplasmaTestingAggregationPipeline(query, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await MycoplasmaTesting.aggregate(
    buildMycoplasmaTestingAggregationPipeline(query, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};

// libs/shared-utils/src/lib/database/mongo_db/repository/barrier_integrity.ts
var buildBarrierIntegrityAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        assay_type: "$assay_type",
        formulas: "$formulas",
        healthy_mean_teer: "$healthy_mean_teer",
        disease_mean_teer: "$disease_mean_teer",
        results: "$results",
        warnings: "$warnings",
        graphs: "$graphs",
        data: "$data",
        meta: "$meta",
        message: "$message",
        success: "$success",
        status: "$status",
        is_active: "$is_active",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project_details: "$project_details"
      }
    }
  ];
  if (sort && Object.keys(sort).length > 0) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number" && skip > 0) {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number" && limit > 0) {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var GetBarrierIntegrity = async (query) => {
  const pipeline = buildBarrierIntegrityAggregationPipeline(query, { createdAt: -1 }, 0, 1);
  const results = await BarrierIntegrity.aggregate(pipeline).exec();
  return results && results.length > 0 ? results[0] : null;
};
var ListBarrierIntegrity = async (query, per_page, page_no, sort = { createdAt: -1 }) => {
  const total_record = await BarrierIntegrity.countDocuments(query);
  if (per_page === -1) {
    const resp2 = await BarrierIntegrity.aggregate(
      buildBarrierIntegrityAggregationPipeline(query, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await BarrierIntegrity.aggregate(
    buildBarrierIntegrityAggregationPipeline(query, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};

// libs/shared-utils/src/lib/database/mongo_db/repository/file_upload.ts
var buildFileUploadAggregationPipeline = (query, sort, skip, limit) => {
  const projectCollection = Project.collection.collectionName;
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  if (Array.isArray(normalizedQuery.$or)) {
    normalizedQuery.$or = normalizedQuery.$or.map((condition) => {
      const cond = { ...condition };
      if (cond.id !== void 0 && !isNaN(Number(cond.id))) cond.id = Number(cond.id);
      if (cond.project_id !== void 0 && !isNaN(Number(cond.project_id))) cond.project_id = Number(cond.project_id);
      return cond;
    });
  }
  const pipeline = [
    { $match: normalizedQuery },
    {
      $lookup: {
        from: projectCollection,
        localField: "project_id",
        foreignField: "id",
        as: "project_details"
      }
    },
    {
      $unwind: {
        path: "$project_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        project_id: "$project_id",
        category: "$category",
        sub_category: "$sub_category",
        filename: "$filename",
        file_type: "$file_type",
        mime_type: "$mime_type",
        object_key: "$object_key",
        file_url: "$file_url",
        expires_in: "$expires_in",
        size: "$size",
        created_at: "$created_at",
        expires_at: "$expires_at",
        status: "$status",
        is_active: "$is_active",
        metadata: "$metadata",
        created_by_id: "$created_by_id",
        updated_by_id: "$updated_by_id",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        project: {
          $cond: {
            if: { $ifNull: ["$project_details", false] },
            then: {
              id: "$project_details.id",
              project_name: "$project_details.project_name",
              project_unique_id: "$project_details.project_unique_id",
              experimental_model: "$project_details.experimental_model",
              test_drug: "$project_details.test_drug",
              reference_drug: "$project_details.reference_drug",
              status: "$project_details.status",
              is_active: "$project_details.is_active"
            },
            else: null
          }
        }
      }
    }
  ];
  if (sort && Object.keys(sort).length) {
    pipeline.push({ $sort: sort });
  }
  if (typeof skip === "number") {
    pipeline.push({ $skip: skip });
  }
  if (typeof limit === "number") {
    pipeline.push({ $limit: limit });
  }
  return pipeline;
};
var CreateFileUpload = async (data) => {
  if (!data.id) {
    const latestDocument = await FileUpload.findOne({}, {}, { sort: { id: -1 } });
    data.id = latestDocument && latestDocument.id ? latestDocument.id + 1 : 1;
  }
  if (!data.created_at) {
    data.created_at = /* @__PURE__ */ new Date();
  } else if (typeof data.created_at === "string" || typeof data.created_at === "number") {
    data.created_at = new Date(data.created_at);
  }
  if (!data.file_type) {
    data.file_type = detectFileType(data.filename, data.mime_type);
  }
  const expiresInSeconds = data.expires_in !== void 0 && !isNaN(Number(data.expires_in)) ? Number(data.expires_in) : 2592e3;
  data.expires_in = expiresInSeconds;
  if (!data.expires_at) {
    data.expires_at = new Date(data.created_at.getTime() + expiresInSeconds * 1e3);
  } else if (typeof data.expires_at === "string" || typeof data.expires_at === "number") {
    data.expires_at = new Date(data.expires_at);
  }
  if (data.project_id !== void 0 && !isNaN(Number(data.project_id))) {
    data.project_id = Number(data.project_id);
  }
  if (!data.category) {
    data.category = "general";
  }
  return await FileUpload.create(data);
};
var BulkCreateFileUpload = async (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return [];
  }
  const latestDocument = await FileUpload.findOne({}, {}, { sort: { id: -1 } });
  let startId = latestDocument && latestDocument.id ? latestDocument.id + 1 : 1;
  const docsToInsert = dataArray.map((item) => {
    const doc = { ...item };
    if (doc.id == null || isNaN(Number(doc.id))) {
      doc.id = startId++;
    }
    if (!doc.created_at) {
      doc.created_at = /* @__PURE__ */ new Date();
    } else if (typeof doc.created_at === "string" || typeof doc.created_at === "number") {
      doc.created_at = new Date(doc.created_at);
    }
    if (!doc.file_type) {
      doc.file_type = detectFileType(doc.filename, doc.mime_type);
    }
    const expiresInSeconds = doc.expires_in !== void 0 && !isNaN(Number(doc.expires_in)) ? Number(doc.expires_in) : 2592e3;
    doc.expires_in = expiresInSeconds;
    if (!doc.expires_at) {
      doc.expires_at = new Date(doc.created_at.getTime() + expiresInSeconds * 1e3);
    } else if (typeof doc.expires_at === "string" || typeof doc.expires_at === "number") {
      doc.expires_at = new Date(doc.expires_at);
    }
    if (doc.project_id !== void 0 && !isNaN(Number(doc.project_id))) {
      doc.project_id = Number(doc.project_id);
    }
    if (!doc.category) {
      doc.category = "general";
    }
    doc.is_active = doc.is_active !== void 0 ? doc.is_active : true;
    doc.status = doc.status || "active";
    return doc;
  });
  return await FileUpload.insertMany(docsToInsert);
};
var UpdateFileUpload = async (query, data) => {
  const updateData = { ...data };
  if (updateData.expires_in !== void 0 && updateData.created_at && !updateData.expires_at) {
    const createdAtDate = new Date(updateData.created_at);
    updateData.expires_at = new Date(createdAtDate.getTime() + Number(updateData.expires_in) * 1e3);
  }
  return await FileUpload.findOneAndUpdate(query, updateData, { new: true });
};
var DeleteFileUpload = async (query) => {
  return await FileUpload.deleteOne(query);
};
var GetFileUpload = async (query) => {
  const data = await FileUpload.aggregate(
    buildFileUploadAggregationPipeline(query, { createdAt: -1 }, 0, 1)
  ).exec();
  return data && data.length > 0 ? data[0] : null;
};
var ListFileUpload = async (query, per_page, page_no, sort) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  if (Array.isArray(normalizedQuery.$or)) {
    normalizedQuery.$or = normalizedQuery.$or.map((condition) => {
      const cond = { ...condition };
      if (cond.id !== void 0 && !isNaN(Number(cond.id))) cond.id = Number(cond.id);
      if (cond.project_id !== void 0 && !isNaN(Number(cond.project_id))) cond.project_id = Number(cond.project_id);
      return cond;
    });
  }
  const total_record = await FileUpload.countDocuments(normalizedQuery);
  if (per_page === -1) {
    const resp2 = await FileUpload.aggregate(
      buildFileUploadAggregationPipeline(normalizedQuery, sort)
    ).exec();
    const pagination2 = {
      per_page: total_record,
      page_no: 1,
      total_rows: total_record,
      total_pages: 1
    };
    return { resp: resp2, pagination: pagination2 };
  }
  const skip_record = (page_no - 1) * per_page;
  const resp = await FileUpload.aggregate(
    buildFileUploadAggregationPipeline(normalizedQuery, sort, skip_record, per_page)
  ).exec();
  const total_pages = Math.ceil(total_record / per_page);
  const pagination = {
    per_page,
    page_no,
    total_rows: total_record,
    total_pages
  };
  return { resp, pagination };
};
var UpsertFileUpload = async (query, data) => {
  const normalizedQuery = { ...query };
  if (normalizedQuery.id !== void 0 && !isNaN(Number(normalizedQuery.id))) {
    normalizedQuery.id = Number(normalizedQuery.id);
  }
  if (normalizedQuery.project_id !== void 0 && !isNaN(Number(normalizedQuery.project_id))) {
    normalizedQuery.project_id = Number(normalizedQuery.project_id);
  }
  const existing = await FileUpload.findOne(normalizedQuery);
  if (!existing && (data.id == null || data.id === void 0)) {
    const latestDocument = await FileUpload.findOne({}, {}, { sort: { id: -1 } });
    data.id = latestDocument && latestDocument.id ? latestDocument.id + 1 : 1;
  }
  if (!data.created_at) {
    data.created_at = existing?.created_at || /* @__PURE__ */ new Date();
  }
  if (!data.file_type) {
    data.file_type = detectFileType(data.filename, data.mime_type);
  }
  const expiresInSeconds = data.expires_in !== void 0 ? Number(data.expires_in) : existing?.expires_in || 2592e3;
  if (!data.expires_at) {
    data.expires_at = new Date(new Date(data.created_at).getTime() + expiresInSeconds * 1e3);
  }
  return await FileUpload.findOneAndUpdate(normalizedQuery, { $set: data }, { upsert: true, new: true });
};

// apps/backend_service/src/controllers/project/service.ts
var ProjectService = class {
  async create(data) {
    try {
      return await createDocument(Project, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(Project, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(Project, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(Project, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await getOne(Project, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      let pagination = await getPagination(Project, query, per_page, page_no);
      let projection = "-__v -_id";
      let resp = await listDocuments(Project, query, per_page, page_no, sort, projection);
      return { resp, pagination };
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async assign(query, data) {
    try {
      await updateDocument(Project, query, data);
      return await getOne(Project, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async createNociceptionAssay(data) {
    try {
      const existing = await getOne(NociceptionAssay, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(NociceptionAssay, data);
      }
      await updateDocument(NociceptionAssay, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createNociceptionAssay ====>>>", err);
      throw err;
    }
  }
  async createGrowthFactorQuantification(data) {
    try {
      const existing = await getOne(GrowthFactorQuantification, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(GrowthFactorQuantification, data);
      }
      await updateDocument(GrowthFactorQuantification, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createGrowthFactorQuantification ====>>>", err);
      throw err;
    }
  }
  async createAdventitiousAgents(data) {
    try {
      const existing = await getOne(AdventitiousAgents, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(AdventitiousAgents, data);
      }
      await updateDocument(AdventitiousAgents, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createAdventitiousAgents ====>>>", err);
      throw err;
    }
  }
  async createInducedInflammation(data) {
    try {
      const existing = await getOne(InducedInflammation, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(InducedInflammation, data);
      }
      await updateDocument(InducedInflammation, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createInducedInflammation ====>>>", err);
      throw err;
    }
  }
  async createMycoplasmaTesting(data) {
    try {
      const existing = await getOne(MycoplasmaTesting, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(MycoplasmaTesting, data);
      }
      await updateDocument(MycoplasmaTesting, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createMycoplasmaTesting ====>>>", err);
      throw err;
    }
  }
  async createWoundHealing(data) {
    try {
      const existing = await getOne(WoundHealing, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(WoundHealing, data);
      }
      await updateDocument(WoundHealing, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createWoundHealing ====>>>", err);
      throw err;
    }
  }
  async createBarrierIntegrity(data) {
    try {
      const existing = await getOne(BarrierIntegrity, { project_id: data.project_id });
      if (!existing) {
        return await createDocument(BarrierIntegrity, data);
      }
      await updateDocument(BarrierIntegrity, { project_id: data.project_id }, { is_active: true, updatedAt: /* @__PURE__ */ new Date() });
      return existing;
    } catch (err) {
      console.log("Error createBarrierIntegrity ====>>>", err);
      throw err;
    }
  }
};
var service_default = ProjectService;

// apps/backend_service/src/controllers/project/handler.ts
var newService = new service_default();
var jsonWebToken = new JsonWebToken();
var normalizeStr = (val) => typeof val === "string" ? val.toLowerCase().replace(/[\s-_]+/g, "_").trim() : "";
var isMechanisticModule = (mod) => {
  const n = normalizeStr(mod);
  return n === "mechanistic_analysis" || n === "mechanistic" || n === "mech";
};
var isNociceptionSubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("nociception") || n === "noci";
};
var isGrowthFactorSubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("growth_factor") || n.includes("growth") || n.includes("vegf");
};
var isSafetyModule = (mod) => {
  const n = normalizeStr(mod);
  return n === "safety_assessment" || n === "safety" || n === "safe";
};
var isAdventitiousSubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("adventitious") || n.includes("viral");
};
var isInducedInflammationSubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("induced_inflammation") || n.includes("inflammation") || n.includes("inflam");
};
var isMycoplasmaSubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("mycoplasma") || n.includes("myco");
};
var isEfficacyModule = (mod) => {
  const n = normalizeStr(mod);
  return n === "efficacy_assessment" || n === "efficacy" || n === "eff";
};
var isWoundHealingSubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("wound") || n.includes("healing") || n.includes("scratch");
};
var isBarrierIntegritySubmodule = (sub) => {
  const n = normalizeStr(sub);
  return n.includes("barrier") || n.includes("teer") || n.includes("integrity");
};
var resolveModuleFlags = (body) => {
  const flags = {
    hasNociception: false,
    hasGrowthFactor: false,
    hasAdventitious: false,
    hasInducedInflammation: false,
    hasMycoplasma: false,
    hasWoundHealing: false,
    hasBarrierIntegrity: false
  };
  const processItem = (mod, sub) => {
    const subList = Array.isArray(sub) ? sub : sub !== void 0 && sub !== null && sub !== "" ? [sub] : [];
    if (isMechanisticModule(mod)) {
      if (subList.length === 0 || subList.some((s) => normalizeStr(s) === "all")) {
        flags.hasNociception = true;
        flags.hasGrowthFactor = true;
      } else {
        for (const s of subList) {
          if (isNociceptionSubmodule(s)) flags.hasNociception = true;
          if (isGrowthFactorSubmodule(s)) flags.hasGrowthFactor = true;
        }
      }
    } else {
      for (const s of subList) {
        if (isNociceptionSubmodule(s)) flags.hasNociception = true;
        if (isGrowthFactorSubmodule(s)) flags.hasGrowthFactor = true;
      }
    }
    if (isSafetyModule(mod)) {
      if (subList.length === 0 || subList.some((s) => normalizeStr(s) === "all")) {
        flags.hasAdventitious = true;
        flags.hasInducedInflammation = true;
        flags.hasMycoplasma = true;
      } else {
        for (const s of subList) {
          if (isAdventitiousSubmodule(s)) flags.hasAdventitious = true;
          if (isInducedInflammationSubmodule(s)) flags.hasInducedInflammation = true;
          if (isMycoplasmaSubmodule(s)) flags.hasMycoplasma = true;
        }
      }
    } else {
      for (const s of subList) {
        if (isAdventitiousSubmodule(s)) flags.hasAdventitious = true;
        if (isInducedInflammationSubmodule(s)) flags.hasInducedInflammation = true;
        if (isMycoplasmaSubmodule(s)) flags.hasMycoplasma = true;
      }
    }
    if (isEfficacyModule(mod)) {
      if (subList.length === 0 || subList.some((s) => normalizeStr(s) === "all")) {
        flags.hasWoundHealing = true;
        flags.hasBarrierIntegrity = true;
      } else {
        for (const s of subList) {
          if (isWoundHealingSubmodule(s)) flags.hasWoundHealing = true;
          if (isBarrierIntegritySubmodule(s)) flags.hasBarrierIntegrity = true;
        }
      }
    } else {
      for (const s of subList) {
        if (isWoundHealingSubmodule(s)) flags.hasWoundHealing = true;
        if (isBarrierIntegritySubmodule(s)) flags.hasBarrierIntegrity = true;
      }
    }
  };
  if (body?.module !== void 0 || body?.submodule !== void 0) {
    processItem(body.module, body.submodule);
  }
  if (Array.isArray(body?.modules)) {
    for (const item of body.modules) {
      if (typeof item === "string") {
        processItem(item, void 0);
      } else if (item && typeof item === "object") {
        processItem(item.module, item.submodule || item.submodules);
      }
    }
  }
  return flags;
};
var initAssayRecords = async (projectId, body, userId) => {
  const flags = resolveModuleFlags(body);
  if (flags.hasNociception) {
    await newService.createNociceptionAssay({
      project_id: projectId,
      assay_name: body.assay_name || "Nociception Assay",
      category: "mechanistic_analysis",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  if (flags.hasGrowthFactor) {
    await newService.createGrowthFactorQuantification({
      project_id: projectId,
      category: body.category || "growth_factor_quantification",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  if (flags.hasAdventitious) {
    await newService.createAdventitiousAgents({
      project_id: projectId,
      category: "safety_assessment",
      assay_type: body.assay_type || "qPCR / RT-qPCR",
      calculation_method: body.calculation_method || "Ct cutoff-based screening",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  if (flags.hasInducedInflammation) {
    await newService.createInducedInflammation({
      project_id: projectId,
      category: "safety_assessment",
      drug_name: body.drug_name || "",
      batch_no: body.batch_no || "",
      marker: body.marker || "",
      method: body.method || "shared",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  if (flags.hasMycoplasma) {
    await newService.createMycoplasmaTesting({
      project_id: projectId,
      category: "safety_assessment",
      assay_type: body.assay_type || "Mycoplasma_qPCR",
      calculation_method: body.calculation_method || "Ct cutoff-based screening",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  if (flags.hasWoundHealing) {
    await newService.createWoundHealing({
      project_id: projectId,
      category: "efficacy_assessment",
      analysis_type: body.analysis_type || "microscopy_image_batch",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  if (flags.hasBarrierIntegrity) {
    await newService.createBarrierIntegrity({
      project_id: projectId,
      category: "efficacy_assessment",
      assay_type: body.assay_type || "Transepithelial Electrical Resistance (TEER)",
      status: body.status || "new",
      is_active: true,
      created_by_id: userId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
};
var Handler = class {
  async create(req, res, next) {
    try {
      let { body, headers } = req;
      let decoded = {};
      if (headers?.authorization) {
        try {
          decoded = await jsonWebToken.verify(headers.authorization.split(" ")[1]);
        } catch {
        }
      }
      body.is_active = true;
      if (decoded?.ID) {
        body.created_by_id = decoded.ID;
      }
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService.create(body);
      if (resp && resp.id && (body?.module || body?.submodule || body?.modules)) {
        await initAssayRecords(resp.id, body, decoded?.ID);
      }
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Project Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "$or": [
          { "id": body?.id },
          { "project_unique_id": body?.project_unique_id }
        ]
      };
      let resp = await newService.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Project Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "id": params?.id
      };
      let resp = await newService.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Project Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Project Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Project Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.project_name === "undefined")) {
        filterQuery.project_name = { $regex: query?.project_name, $options: "i" };
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      let resp = await newService.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "Project retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async assign(req, res, next) {
    try {
      let { body, query, params, headers } = req;
      const rawProjectId = query?.project_id || query?.id || query?.projectId || params?.id || body?.project_id || body?.id;
      if (!rawProjectId) {
        return res.status(400).json(apiResponse.FAILURE_RESP({}, {
          name: "Validation Error",
          message: "project_id is required in query"
        }, "project_id is required in query"));
      }
      const { module, submodule } = body || {};
      if (module === void 0 && submodule === void 0 && body?.modules === void 0) {
        return res.status(400).json(apiResponse.FAILURE_RESP({}, {
          name: "Validation Error",
          message: "module and submodule are required in payload"
        }, "Validation Failed"));
      }
      let decoded = {};
      if (headers?.authorization) {
        try {
          decoded = await jsonWebToken.verify(headers.authorization.split(" ")[1]);
        } catch {
        }
      }
      const userId = decoded?.ID;
      const numId = !isNaN(Number(rawProjectId)) ? Number(rawProjectId) : null;
      let projectQuery = numId !== null ? { "$or": [{ "id": numId }, { "project_unique_id": String(rawProjectId) }] } : { "project_unique_id": String(rawProjectId) };
      let existingProject = await newService.get(projectQuery);
      if (!existingProject) {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Project with ID ${rawProjectId} not found`
        }, "Project Not Found"));
      }
      let updateData = {
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (module !== void 0) {
        updateData.module = module;
      }
      if (submodule !== void 0) {
        updateData.submodule = submodule;
      }
      let existingAssigned = Array.isArray(existingProject.assigned_modules) ? [...existingProject.assigned_modules] : [];
      if (module !== void 0 || submodule !== void 0) {
        const assignmentEntry = {
          module: module !== void 0 ? module : existingProject.module,
          submodule: submodule !== void 0 ? submodule : existingProject.submodule,
          assigned_at: /* @__PURE__ */ new Date()
        };
        const existingIdx = existingAssigned.findIndex((item) => item?.module === assignmentEntry.module);
        if (existingIdx >= 0) {
          existingAssigned[existingIdx] = assignmentEntry;
        } else {
          existingAssigned.push(assignmentEntry);
        }
        updateData.assigned_modules = existingAssigned;
        updateData.modules = existingAssigned;
      } else if (body?.modules && Array.isArray(body.modules)) {
        updateData.assigned_modules = body.modules;
        updateData.modules = body.modules;
      }
      await initAssayRecords(existingProject.id, body, userId);
      let resp = await newService.assign(projectQuery, updateData);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Module and Submodule Assigned Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default = Handler;

// apps/backend_service/src/controllers/project/validation.ts
import { z } from "zod";
var ProjectSchema = z.object({
  project_name: z.string().optional(),
  project_unique_id: z.string().optional(),
  experimental_model: z.string().optional(),
  test_drug: z.string().optional(),
  reference_drug: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  lookup_type: z.string().optional(),
  lookup_code: z.string().optional(),
  display_name: z.string().optional(),
  is_enabled: z.boolean().optional(),
  module: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  submodule: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  modules: z.array(z.any()).optional(),
  assigned_modules: z.array(z.any()).optional()
}).passthrough();
function projectLookupCode(req, res, next) {
  const result = ProjectSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}
var AssignModuleSchema = z.object({
  module: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  submodule: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  modules: z.array(z.any()).optional()
}).passthrough();
function validateAssign(req, res, next) {
  const rawProjectId = req.query?.project_id || req.query?.id || req.query?.projectId || req.params?.id || req.body?.project_id || req.body?.id;
  if (!rawProjectId) {
    return res.status(400).json(apiResponse.FAILURE_RESP({}, {
      name: "Validation Error",
      message: "project_id is required in query"
    }, "project_id is required in query"));
  }
  const result = AssignModuleSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/project/router.ts
var newHandler = new handler_default();
var router = express.Router();
router.post("/create", authentication, projectLookupCode, newHandler.create);
router.post("/assign", authentication, validateAssign, newHandler.assign);
router.post("/:id/assign", authentication, validateAssign, newHandler.assign);
router.post("/:id/update", authentication, projectLookupCode, newHandler.update);
router.post("/upsert", authentication, projectLookupCode, newHandler.upsert);
router.delete("/:id/delete", authentication, newHandler.delete);
router.get("/:id", authentication, newHandler.get);
router.get("", authentication, newHandler.list);
var router_default = router;

// apps/backend_service/src/controllers/mechanistic_analysis/growth_factor_quantification/router.ts
import express2 from "express";

// apps/backend_service/src/controllers/mechanistic_analysis/growth_factor_quantification/service.ts
var GrowthFactorQuantificationService = class {
  async create(data) {
    try {
      return await createDocument(GrowthFactorQuantification, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(GrowthFactorQuantification, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(GrowthFactorQuantification, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(GrowthFactorQuantification, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetGrowthFactorQuantification(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListGrowthFactorQuantification(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default2 = GrowthFactorQuantificationService;

// apps/backend_service/src/controllers/mechanistic_analysis/growth_factor_quantification/handler.ts
var newService2 = new service_default2();
var jsonWebToken2 = new JsonWebToken();
var Handler2 = class {
  async create(req, res, next) {
    try {
      let { body, headers } = req;
      if (headers?.authorization) {
        let token = headers.authorization.split(" ")[1];
        if (token) {
          let decoded = await jsonWebToken2.verify(token);
          body.created_by_id = decoded?.ID;
        }
      }
      body.is_active = true;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService2.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "GrowthFactorQuantification Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {};
      if (body?.id) {
        query.id = body.id;
      } else if (body?.category && body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category },
            { "project_id": body?.project_id }
          ]
        };
      } else {
        query = { "category": body?.category };
      }
      let resp = await newService2.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "GrowthFactorQuantification Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "id": params?.id
      };
      let resp = await newService2.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "GrowthFactorQuantification Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService2.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "GrowthFactorQuantification Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService2.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "GrowthFactorQuantification Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.category === "undefined")) {
        filterQuery.category = query?.category;
      }
      if (!(typeof query?.project_id === "undefined")) {
        filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let resp = await newService2.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "GrowthFactorQuantification retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default2 = Handler2;

// apps/backend_service/src/controllers/mechanistic_analysis/growth_factor_quantification/validation.ts
import { z as z2 } from "zod";
var LaneResultSchema = z2.object({
  lane_no: z2.number().optional(),
  lane: z2.string().optional(),
  lane_category: z2.string().optional(),
  lane_group: z2.string().optional(),
  sample_label: z2.string().optional(),
  estimated_center_percentage: z2.string().optional(),
  status: z2.string().optional(),
  target_intensity: z2.number().optional(),
  beta_actin_intensity: z2.number().optional(),
  common_beta_actin_reference: z2.number().optional(),
  normalized_expression: z2.number().optional(),
  fold_change_vs_reference: z2.number().optional(),
  rank: z2.number().optional(),
  target_background: z2.number().optional(),
  target_saturated_fraction: z2.number().optional(),
  actin_saturated_fraction: z2.number().optional()
});
var ImageResultSchema = z2.object({
  pair_number: z2.number().optional(),
  category: z2.string().optional(),
  target_image: z2.object({
    filename: z2.string().optional(),
    original_image_base64: z2.string().optional(),
    processed_image_base64: z2.string().optional()
  }).optional(),
  actin_image: z2.object({
    filename: z2.string().optional(),
    original_image_base64: z2.string().optional(),
    processed_image_base64: z2.string().optional()
  }).optional(),
  results: z2.array(LaneResultSchema).optional(),
  graphs: z2.object({
    target_intensity_graph_base64: z2.string().optional(),
    normalized_expression_graph_base64: z2.string().optional(),
    fold_change_graph_base64: z2.string().optional()
  }).passthrough().optional()
}).passthrough();
var GrowthFactorQuantificationSchema = z2.object({
  project_id: z2.union([z2.number(), z2.string()]).optional(),
  category: z2.string().min(1, "Category is required"),
  message: z2.string().optional(),
  success: z2.boolean().optional(),
  number_of_image_pairs: z2.number().optional(),
  no_of_layers: z2.number().optional(),
  lane_order: z2.string().optional(),
  image_results: z2.array(ImageResultSchema).optional(),
  status: z2.string().optional(),
  is_active: z2.boolean().optional()
}).passthrough();
function validateGrowthFactorQuantification(req, res, next) {
  const result = GrowthFactorQuantificationSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/mechanistic_analysis/growth_factor_quantification/router.ts
var newHandler2 = new handler_default2();
var router2 = express2.Router();
router2.post("/create", authentication, validateGrowthFactorQuantification, newHandler2.create);
router2.post("/:id/update", authentication, validateGrowthFactorQuantification, newHandler2.update);
router2.post("/upsert", authentication, validateGrowthFactorQuantification, newHandler2.upsert);
router2.delete("/:id/delete", authentication, newHandler2.delete);
router2.get("/:id", authentication, newHandler2.get);
router2.get("", authentication, newHandler2.list);
var router_default2 = router2;

// apps/backend_service/src/controllers/mechanistic_analysis/router.ts
import express4 from "express";

// apps/backend_service/src/controllers/mechanistic_analysis/nociception_assay/router.ts
import express3 from "express";

// apps/backend_service/src/controllers/mechanistic_analysis/nociception_assay/service.ts
var NociceptionAssayService = class {
  async create(data) {
    try {
      return await createDocument(NociceptionAssay, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await UpsertNociceptionAssay(query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(NociceptionAssay, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(NociceptionAssay, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetNociceptionAssay(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListNociceptionAssay(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default3 = NociceptionAssayService;

// apps/backend_service/src/controllers/mechanistic_analysis/nociception_assay/handler.ts
var newService3 = new service_default3();
var jsonWebToken3 = new JsonWebToken();
function normalizePayload(body, query) {
  if (!body || typeof body !== "object") {
    body = {};
  }
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    body = {
      ...body.data,
      ...body,
      data: body.data
    };
  }
  if (!body.project_id && query?.project_id) {
    body.project_id = query.project_id;
  }
  if (body.project_id !== void 0 && body.project_id !== null && !isNaN(Number(body.project_id))) {
    body.project_id = Number(body.project_id);
  }
  if (body.id !== void 0 && body.id !== null && !isNaN(Number(body.id))) {
    body.id = Number(body.id);
  }
  if (body.control_group && !body.calibrator) {
    body.calibrator = body.control_group;
  } else if (body.calibrator && !body.control_group) {
    body.control_group = body.calibrator;
  }
  if (body.genes && !body.markers) {
    body.markers = body.genes;
  } else if (body.markers && !body.genes) {
    body.genes = body.markers;
  }
  if (body.final_result && !body.results) {
    body.results = body.final_result;
  } else if (body.results && !body.final_result) {
    body.final_result = body.results;
  }
  const activeGraph = body.graph || body.graphs || body.images;
  if (activeGraph) {
    if (!body.graph) body.graph = activeGraph;
    if (!body.graphs) body.graphs = activeGraph;
    if (!body.images) body.images = activeGraph;
  }
  return body;
}
var Handler3 = class {
  async create(req, res, next) {
    try {
      let { body, headers, query } = req;
      let decoded = {};
      if (headers?.authorization) {
        try {
          decoded = await jsonWebToken3.verify(headers.authorization.split(" ")[1]);
        } catch {
        }
      }
      body = normalizePayload(body, query);
      body.is_active = true;
      body.created_by_id = decoded?.ID;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService3.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "NociceptionAssay Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body, query: reqQuery } = req;
      body = normalizePayload(body, reqQuery);
      body.updatedAt = /* @__PURE__ */ new Date();
      const conditions = [];
      if (body?.id !== void 0 && !isNaN(Number(body.id))) {
        conditions.push({ id: Number(body.id) });
      }
      if (body?.project_id !== void 0 && !isNaN(Number(body.project_id))) {
        conditions.push({ project_id: Number(body.project_id) });
      }
      let query = {};
      if (conditions.length > 1) {
        query = { $or: conditions };
      } else if (conditions.length === 1) {
        query = conditions[0];
      } else {
        query = { id: 0 };
      }
      let resp = await newService3.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "NociceptionAssay Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params, query: reqQuery } = req;
      body = normalizePayload(body, reqQuery);
      body.updatedAt = /* @__PURE__ */ new Date();
      let idParam = params?.id;
      let query = {};
      if (idParam !== void 0 && !isNaN(Number(idParam))) {
        query = {
          $or: [
            { id: Number(idParam) },
            { project_id: Number(idParam) }
          ]
        };
      } else {
        query = { id: idParam };
      }
      let resp = await newService3.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "NociceptionAssay Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let idParam = params?.id;
      let query = {};
      if (idParam !== void 0 && !isNaN(Number(idParam))) {
        query = {
          $or: [
            { id: Number(idParam) },
            { project_id: Number(idParam) }
          ]
        };
      } else {
        query = { id: idParam };
      }
      let resp = await newService3.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "NociceptionAssay Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params, query } = req;
      let idParam = params?.id;
      let findQuery = {};
      if (idParam !== void 0 && !isNaN(Number(idParam))) {
        findQuery = {
          $or: [
            { id: Number(idParam) },
            { project_id: Number(idParam) }
          ]
        };
      } else if (idParam) {
        findQuery = { id: idParam };
      } else if (query?.project_id && !isNaN(Number(query.project_id))) {
        findQuery = { project_id: Number(query.project_id) };
      }
      let resp = await newService3.get(findQuery);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "NociceptionAssay Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.project_id === "undefined")) {
        const numericProjectId = Number(query.project_id);
        filterQuery.project_id = !isNaN(numericProjectId) ? numericProjectId : query.project_id;
      }
      if (!(typeof query?.assay_name === "undefined")) {
        filterQuery.assay_name = { $regex: query?.assay_name, $options: "i" };
      }
      if (!(typeof query?.control_group === "undefined")) {
        filterQuery.$or = [
          { control_group: { $regex: query?.control_group, $options: "i" } },
          { calibrator: { $regex: query?.control_group, $options: "i" } }
        ];
      } else if (!(typeof query?.calibrator === "undefined")) {
        filterQuery.$or = [
          { control_group: { $regex: query?.calibrator, $options: "i" } },
          { calibrator: { $regex: query?.calibrator, $options: "i" } }
        ];
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      let resp = await newService3.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "NociceptionAssay retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default3 = Handler3;

// apps/backend_service/src/controllers/mechanistic_analysis/nociception_assay/validation.ts
import { z as z3 } from "zod";
var NociceptionAssaySchema = z3.object({
  id: z3.union([z3.number(), z3.string()]).optional(),
  project_id: z3.union([z3.number(), z3.string()]).optional(),
  assay_name: z3.string().optional(),
  category: z3.string().optional(),
  calculation_method: z3.string().optional(),
  control_group: z3.string().optional(),
  calibrator: z3.string().optional(),
  groups: z3.array(z3.string()).optional(),
  genes: z3.array(z3.string()).optional(),
  markers: z3.array(z3.string()).optional(),
  biological_replicates: z3.array(z3.string()).optional(),
  formulas: z3.any().optional(),
  cq_values: z3.any().optional(),
  loading_control: z3.any().optional(),
  dct_ddct_fold_change: z3.any().optional(),
  biological_replicate_averages: z3.any().optional(),
  final_result: z3.any().optional(),
  results: z3.any().optional(),
  graph: z3.any().optional(),
  graphs: z3.any().optional(),
  images: z3.any().optional(),
  samples: z3.array(z3.any()).optional(),
  data: z3.any().optional(),
  meta: z3.any().optional(),
  message: z3.string().optional(),
  status: z3.string().optional(),
  description: z3.string().optional(),
  is_active: z3.boolean().optional()
}).passthrough();
function validateNociceptionAssay(req, res, next) {
  const payloadToValidate = req.body?.data && typeof req.body.data === "object" && !req.body.calculation_method && !req.body.control_group ? { ...req.body.data, ...req.body } : req.body;
  const result = NociceptionAssaySchema.safeParse(payloadToValidate);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/mechanistic_analysis/nociception_assay/router.ts
var newHandler3 = new handler_default3();
var router3 = express3.Router();
router3.post("/create", authentication, validateNociceptionAssay, newHandler3.create);
router3.post("/:id/update", authentication, validateNociceptionAssay, newHandler3.update);
router3.post("/upsert", authentication, validateNociceptionAssay, newHandler3.upsert);
router3.delete("/:id/delete", authentication, newHandler3.delete);
router3.get("/:id", authentication, newHandler3.get);
router3.get("", authentication, newHandler3.list);
var router_default3 = router3;

// apps/backend_service/src/controllers/mechanistic_analysis/router.ts
var router4 = express4.Router();
router4.use("/nociception-assay", router_default3);
router4.use("/nociception", router_default3);
router4.use("/", router_default3);
router4.use("/mechanistic-analysis", router_default2);
var router_default4 = router4;

// apps/backend_service/src/controllers/safety_assessment/adventitious_agents/router.ts
import express5 from "express";

// apps/backend_service/src/controllers/safety_assessment/adventitious_agents/service.ts
var AdventitiousAgentsService = class {
  async create(data) {
    try {
      return await createDocument(AdventitiousAgents, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(AdventitiousAgents, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(AdventitiousAgents, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(AdventitiousAgents, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetAdventitiousAgents(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListAdventitiousAgents(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default4 = AdventitiousAgentsService;

// apps/backend_service/src/controllers/safety_assessment/adventitious_agents/handler.ts
var newService4 = new service_default4();
var jsonWebToken4 = new JsonWebToken();
var Handler4 = class {
  async create(req, res, next) {
    try {
      let { body, headers, query } = req;
      if (headers?.authorization) {
        let token = headers.authorization.split(" ")[1];
        if (token) {
          try {
            let decoded = await jsonWebToken4.verify(token);
            body.created_by_id = decoded?.ID;
          } catch {
          }
        }
      }
      if (!body?.project_id && query?.project_id) {
        body.project_id = query.project_id;
      }
      if (!body?.category) {
        body.category = "safety_assessment";
      }
      body.is_active = true;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService4.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "AdventitiousAgents Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {};
      if (body?.id) {
        query.id = body.id;
      } else if (body?.category && body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category },
            { "project_id": body?.project_id }
          ]
        };
      } else if (body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category || "safety_assessment" },
            { "project_id": body?.project_id }
          ]
        };
      } else {
        query = { "category": body?.category || "safety_assessment" };
      }
      let resp = await newService4.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "AdventitiousAgents Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "id": params?.id
      };
      let resp = await newService4.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "AdventitiousAgents Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService4.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "AdventitiousAgents Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService4.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "AdventitiousAgents Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.category === "undefined")) {
        filterQuery.category = query?.category;
      }
      if (!(typeof query?.project_id === "undefined")) {
        filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      if (!(typeof query?.assay_type === "undefined")) {
        filterQuery.assay_type = { $regex: query?.assay_type, $options: "i" };
      }
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let resp = await newService4.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "AdventitiousAgents retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default4 = Handler4;

// apps/backend_service/src/controllers/safety_assessment/adventitious_agents/validation.ts
import { z as z4 } from "zod";
var SampleDetailsSchema = z4.object({
  sample_id: z4.string().optional(),
  sample_type: z4.string().optional(),
  collection_point: z4.string().optional(),
  extraction_method: z4.string().optional(),
  internal_control_type: z4.string().optional(),
  internal_control_name: z4.string().optional(),
  extraction_control_status: z4.string().optional()
}).passthrough();
var InternalControlRangeSchema = z4.object({
  min_ct: z4.number().optional(),
  max_ct: z4.number().optional()
}).passthrough();
var AssayConfigurationItemSchema = z4.object({
  viral_agent: z4.string().optional(),
  assay: z4.string().optional(),
  positive_control_id: z4.string().optional(),
  cutoff: z4.number().optional(),
  borderline_interval: z4.number().optional(),
  lod: z4.union([z4.number(), z4.string()]).optional(),
  max_accepted_ct: z4.number().optional(),
  internal_control_range: InternalControlRangeSchema.optional(),
  suggested_internal_control: z4.string().optional()
}).passthrough();
var ViralInputSchema = z4.object({
  viral_agent: z4.string().optional(),
  sample_ct: z4.number().optional(),
  positive_control_ct: z4.number().optional(),
  negative_control_ct: z4.number().optional(),
  internal_control_ct: z4.number().optional()
}).passthrough();
var SampleItemSchema = z4.object({
  sample_id: z4.string().optional(),
  sample_type: z4.string().optional(),
  collection_point: z4.string().optional(),
  extraction_method: z4.string().optional(),
  viral_inputs: z4.array(ViralInputSchema).optional()
}).passthrough();
var BorderlineRangeSchema = z4.object({
  lower_inclusive: z4.number().optional(),
  upper_exclusive: z4.number().optional()
}).passthrough();
var ResultItemSchema = z4.object({
  viral_agent: z4.string().optional(),
  assay: z4.string().optional(),
  positive_control_id: z4.string().optional(),
  sample_ct: z4.number().optional(),
  sample_ct_status: z4.string().optional(),
  positive_control_ct: z4.number().optional(),
  positive_control_status: z4.string().optional(),
  negative_control_ct: z4.number().optional(),
  negative_control_status: z4.string().optional(),
  internal_control_ct: z4.number().optional(),
  internal_control_status: z4.string().optional(),
  delta_ct_sample_minus_positive: z4.number().optional(),
  cutoff: z4.number().optional(),
  borderline_interval: z4.number().optional(),
  borderline_range: BorderlineRangeSchema.optional(),
  lod: z4.union([z4.number(), z4.string()]).optional(),
  max_accepted_ct: z4.number().optional(),
  internal_control_range: InternalControlRangeSchema.optional(),
  run_validity: z4.string().optional(),
  internal_control_qc: z4.string().optional(),
  qc_status: z4.string().optional(),
  screening_result: z4.string().optional(),
  interpretation: z4.string().optional(),
  notes: z4.array(z4.any()).optional()
}).passthrough();
var SummarySchema = z4.object({
  total_targets: z4.number().optional(),
  not_detected: z4.number().optional(),
  detected: z4.number().optional(),
  inconclusive: z4.number().optional(),
  invalid: z4.number().optional(),
  overall_viral_screening_status: z4.string().optional(),
  assay_controls: z4.string().optional(),
  pcr_inhibition: z4.string().optional(),
  overall_safety_assessment: z4.string().optional()
}).passthrough();
var AdventitiousAgentsSchema = z4.object({
  project_id: z4.union([z4.number(), z4.string()]).optional(),
  category: z4.string().optional(),
  assay_type: z4.string().optional(),
  calculation_method: z4.string().optional(),
  sample_details: SampleDetailsSchema.optional(),
  assay_configuration: z4.array(AssayConfigurationItemSchema).optional(),
  samples: z4.array(SampleItemSchema).optional(),
  results: z4.array(ResultItemSchema).optional(),
  summary: SummarySchema.optional(),
  graphs: z4.any().optional(),
  message: z4.string().optional(),
  success: z4.boolean().optional(),
  status: z4.string().optional(),
  is_active: z4.boolean().optional()
}).passthrough();
function validateAdventitiousAgents(req, res, next) {
  const result = AdventitiousAgentsSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/safety_assessment/adventitious_agents/router.ts
var newHandler4 = new handler_default4();
var router5 = express5.Router();
router5.post("/create", authentication, validateAdventitiousAgents, newHandler4.create);
router5.post("/:id/update", authentication, validateAdventitiousAgents, newHandler4.update);
router5.post("/upsert", authentication, validateAdventitiousAgents, newHandler4.upsert);
router5.delete("/:id/delete", authentication, newHandler4.delete);
router5.get("/:id", authentication, newHandler4.get);
router5.get("", authentication, newHandler4.list);
var router_default5 = router5;

// apps/backend_service/src/controllers/safety_assessment/router.ts
import express8 from "express";

// apps/backend_service/src/controllers/safety_assessment/induced_inflammation/router.ts
import express6 from "express";

// apps/backend_service/src/controllers/safety_assessment/induced_inflammation/service.ts
var InducedInflammationService = class {
  async create(data) {
    try {
      return await createDocument(InducedInflammation, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(InducedInflammation, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(InducedInflammation, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(InducedInflammation, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetInducedInflammation(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListInducedInflammation(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default5 = InducedInflammationService;

// apps/backend_service/src/controllers/safety_assessment/induced_inflammation/handler.ts
var newService5 = new service_default5();
var jsonWebToken5 = new JsonWebToken();
var Handler5 = class {
  async create(req, res, next) {
    try {
      let { body, headers, query } = req;
      if (headers?.authorization) {
        let token = headers.authorization.split(" ")[1];
        if (token) {
          try {
            let decoded = await jsonWebToken5.verify(token);
            body.created_by_id = decoded?.ID;
          } catch {
          }
        }
      }
      if (!body?.project_id && query?.project_id) {
        body.project_id = query.project_id;
      }
      if (!body?.category) {
        body.category = "safety_assessment";
      }
      body.is_active = true;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService5.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "InducedInflammation Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {};
      if (body?.id) {
        query.id = body.id;
      } else if (body?.category && body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category },
            { "project_id": body?.project_id }
          ]
        };
      } else if (body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category || "safety_assessment" },
            { "project_id": body?.project_id }
          ]
        };
      } else {
        query = { "category": body?.category || "safety_assessment" };
      }
      let resp = await newService5.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "InducedInflammation Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "id": params?.id
      };
      let resp = await newService5.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "InducedInflammation Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService5.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "InducedInflammation Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService5.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "InducedInflammation Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.category === "undefined")) {
        filterQuery.category = query?.category;
      }
      if (!(typeof query?.project_id === "undefined")) {
        filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      if (!(typeof query?.drug_name === "undefined")) {
        filterQuery.drug_name = { $regex: query?.drug_name, $options: "i" };
      }
      if (!(typeof query?.batch_no === "undefined")) {
        filterQuery.batch_no = query?.batch_no;
      }
      if (!(typeof query?.marker === "undefined")) {
        filterQuery.marker = query?.marker;
      }
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let resp = await newService5.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "InducedInflammation retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default5 = Handler5;

// apps/backend_service/src/controllers/safety_assessment/induced_inflammation/validation.ts
import { z as z5 } from "zod";
var RelativePotencySchema = z5.object({
  value: z5.number().optional(),
  unit: z5.string().optional(),
  method: z5.string().optional()
}).passthrough();
var StandardCurveSchema = z5.object({
  parameters: z5.any().optional(),
  table: z5.array(z5.any()).optional()
}).passthrough();
var PotencyCurveSchema = z5.object({
  parameters: z5.any().optional(),
  table: z5.array(z5.any()).optional()
}).passthrough();
var InducedInflammationSchema = z5.object({
  project_id: z5.union([z5.number(), z5.string()]).optional(),
  category: z5.string().optional(),
  drug_name: z5.string().optional(),
  batch_no: z5.string().optional(),
  marker: z5.string().optional(),
  dilution_factor: z5.number().optional(),
  subtract_blank: z5.boolean().optional(),
  method: z5.string().optional(),
  test_drug_group: z5.string().optional(),
  reference_drug_group: z5.string().optional(),
  available_sample_groups: z5.array(z5.string()).optional(),
  warnings: z5.array(z5.any()).optional(),
  blank: z5.number().optional(),
  n_blank: z5.number().optional(),
  relative_potency: RelativePotencySchema.optional(),
  standard_curve: StandardCurveSchema.optional(),
  potency_curve: PotencyCurveSchema.optional(),
  samples: z5.array(z5.any()).optional(),
  graphs: z5.any().optional(),
  exports: z5.any().optional(),
  uploaded_file: z5.any().optional(),
  message: z5.string().optional(),
  success: z5.boolean().optional(),
  status: z5.string().optional(),
  is_active: z5.boolean().optional()
}).passthrough();
function validateInducedInflammation(req, res, next) {
  const result = InducedInflammationSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/safety_assessment/induced_inflammation/router.ts
var newHandler5 = new handler_default5();
var router6 = express6.Router();
router6.post("/create", authentication, validateInducedInflammation, newHandler5.create);
router6.post("/:id/update", authentication, validateInducedInflammation, newHandler5.update);
router6.post("/upsert", authentication, validateInducedInflammation, newHandler5.upsert);
router6.delete("/:id/delete", authentication, newHandler5.delete);
router6.get("/:id", authentication, newHandler5.get);
router6.get("", authentication, newHandler5.list);
var router_default6 = router6;

// apps/backend_service/src/controllers/safety_assessment/mycoplasma_testing/router.ts
import express7 from "express";

// apps/backend_service/src/controllers/safety_assessment/mycoplasma_testing/service.ts
var MycoplasmaTestingService = class {
  async create(data) {
    try {
      return await createDocument(MycoplasmaTesting, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(MycoplasmaTesting, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(MycoplasmaTesting, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(MycoplasmaTesting, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetMycoplasmaTesting(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListMycoplasmaTesting(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default6 = MycoplasmaTestingService;

// apps/backend_service/src/controllers/safety_assessment/mycoplasma_testing/handler.ts
var newService6 = new service_default6();
var jsonWebToken6 = new JsonWebToken();
var normalizeMycoplasmaPayload = (data) => {
  if (data?.results && Array.isArray(data.results)) {
    data.results = data.results.map((res) => {
      if (res) {
        if (res.negative_control_ct !== void 0 && res.negative_control === void 0) {
          res.negative_control = res.negative_control_ct;
        }
        if (res.negative_control !== void 0 && res.negative_control_ct === void 0) {
          if (typeof res.negative_control === "number") {
            res.negative_control_ct = res.negative_control;
          } else if (typeof res.negative_control === "string" && !isNaN(Number(res.negative_control))) {
            res.negative_control_ct = Number(res.negative_control);
          } else if (typeof res.negative_control === "string" && res.negative_control_status === void 0) {
            res.negative_control_status = res.negative_control;
          }
        }
      }
      return res;
    });
  }
  return data;
};
var Handler6 = class {
  async create(req, res, next) {
    try {
      let { body, headers, query } = req;
      body = normalizeMycoplasmaPayload(body);
      if (headers?.authorization) {
        let token = headers.authorization.split(" ")[1];
        if (token) {
          try {
            let decoded = await jsonWebToken6.verify(token);
            body.created_by_id = decoded?.ID;
          } catch {
          }
        }
      }
      if (!body?.project_id && query?.project_id) {
        body.project_id = query.project_id;
      }
      if (!body?.category) {
        body.category = "safety_assessment";
      }
      body.is_active = true;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService6.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "MycoplasmaTesting Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body = normalizeMycoplasmaPayload(body);
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {};
      if (body?.id) {
        query.id = body.id;
      } else if (body?.category && body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category },
            { "project_id": body?.project_id }
          ]
        };
      } else if (body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category || "safety_assessment" },
            { "project_id": body?.project_id }
          ]
        };
      } else {
        query = { "category": body?.category || "safety_assessment" };
      }
      let resp = await newService6.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "MycoplasmaTesting Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body = normalizeMycoplasmaPayload(body);
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "id": params?.id
      };
      let resp = await newService6.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "MycoplasmaTesting Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService6.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "MycoplasmaTesting Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService6.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "MycoplasmaTesting Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.category === "undefined")) {
        filterQuery.category = query?.category;
      }
      if (!(typeof query?.project_id === "undefined")) {
        filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      if (!(typeof query?.assay_type === "undefined")) {
        filterQuery.assay_type = { $regex: query?.assay_type, $options: "i" };
      }
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let resp = await newService6.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "MycoplasmaTesting retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default6 = Handler6;

// apps/backend_service/src/controllers/safety_assessment/mycoplasma_testing/validation.ts
import { z as z6 } from "zod";
var AssayRulesSchema = z6.object({
  cutoff: z6.number().nullable().optional(),
  borderline: z6.number().nullable().optional(),
  borderline_lower_limit: z6.number().nullable().optional(),
  max_ct: z6.number().nullable().optional(),
  internal_control_min: z6.number().nullable().optional(),
  internal_control_max: z6.number().nullable().optional(),
  positive_control_requirement: z6.string().nullable().optional(),
  negative_control_requirement: z6.string().nullable().optional(),
  extraction_blank_requirement: z6.string().nullable().optional()
}).passthrough();
var MycoplasmaSampleSchema = z6.object({
  sample_id: z6.string().optional(),
  target_ct: z6.number().nullable().optional(),
  internal_control_ct: z6.number().nullable().optional(),
  positive_control_ct: z6.number().nullable().optional(),
  negative_control_ct: z6.number().nullable().optional()
}).passthrough();
var BorderlineRangeSchema2 = z6.object({
  lower_inclusive: z6.number().nullable().optional(),
  upper_exclusive: z6.number().nullable().optional()
}).passthrough();
var MycoplasmaResultSchema = z6.object({
  sample_id: z6.string().optional(),
  target_ct: z6.number().nullable().optional(),
  target_ct_status: z6.string().nullable().optional(),
  internal_control_ct: z6.number().nullable().optional(),
  internal_control_status: z6.string().nullable().optional(),
  positive_control_ct: z6.number().nullable().optional(),
  positive_control_status: z6.string().nullable().optional(),
  negative_control_ct: z6.number().nullable().optional(),
  negative_control_status: z6.string().nullable().optional(),
  negative_control: z6.union([z6.number(), z6.string(), z6.null()]).optional(),
  extraction_blank: z6.string().nullable().optional(),
  delta_ct_target_minus_positive_control: z6.number().nullable().optional(),
  delta_ct_target_minus_negative_control: z6.number().nullable().optional(),
  cutoff: z6.number().nullable().optional(),
  borderline_range: BorderlineRangeSchema2.nullable().optional(),
  screening_result: z6.string().nullable().optional(),
  interpretation: z6.string().nullable().optional(),
  qc_status: z6.string().nullable().optional()
}).passthrough();
var MycoplasmaTestingSchema = z6.object({
  project_id: z6.union([z6.number(), z6.string()]).optional(),
  category: z6.string().optional(),
  assay_type: z6.string().optional(),
  calculation_method: z6.string().optional(),
  assay_rules: AssayRulesSchema.nullable().optional(),
  samples: z6.array(MycoplasmaSampleSchema).optional(),
  results: z6.array(MycoplasmaResultSchema).optional(),
  graphs: z6.any().optional(),
  message: z6.string().optional(),
  success: z6.boolean().optional(),
  status: z6.string().optional(),
  is_active: z6.boolean().optional()
}).passthrough();
function validateMycoplasmaTesting(req, res, next) {
  const result = MycoplasmaTestingSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/safety_assessment/mycoplasma_testing/router.ts
var newHandler6 = new handler_default6();
var router7 = express7.Router();
router7.post("/create", authentication, validateMycoplasmaTesting, newHandler6.create);
router7.post("/:id/update", authentication, validateMycoplasmaTesting, newHandler6.update);
router7.post("/upsert", authentication, validateMycoplasmaTesting, newHandler6.upsert);
router7.delete("/:id/delete", authentication, newHandler6.delete);
router7.get("/:id", authentication, newHandler6.get);
router7.get("", authentication, newHandler6.list);
var router_default7 = router7;

// apps/backend_service/src/controllers/safety_assessment/router.ts
var router8 = express8.Router();
router8.use("/adventitious-agents", router_default5);
router8.use("/adventitious_agents", router_default5);
router8.use("/induced-inflammation", router_default6);
router8.use("/induced_inflammation", router_default6);
router8.use("/mycoplasma-testing", router_default7);
router8.use("/mycoplasma_testing", router_default7);
router8.use("/", router_default5);
var router_default8 = router8;

// apps/backend_service/src/controllers/efficacy_assessment/wound_healing/router.ts
import express9 from "express";

// apps/backend_service/src/controllers/efficacy_assessment/wound_healing/service.ts
var WoundHealingService = class {
  async create(data) {
    try {
      return await createDocument(WoundHealing, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(WoundHealing, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(WoundHealing, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(WoundHealing, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetWoundHealing(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListWoundHealing(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default7 = WoundHealingService;

// apps/backend_service/src/controllers/efficacy_assessment/wound_healing/handler.ts
var newService7 = new service_default7();
var jsonWebToken7 = new JsonWebToken();
var Handler7 = class {
  async create(req, res, next) {
    try {
      let { body, headers, query } = req;
      if (headers?.authorization) {
        let token = headers.authorization.split(" ")[1];
        if (token) {
          try {
            let decoded = await jsonWebToken7.verify(token);
            body.created_by_id = decoded?.ID;
          } catch {
          }
        }
      }
      if (!body?.project_id && query?.project_id) {
        body.project_id = query.project_id;
      }
      if (!body?.category) {
        body.category = "efficacy_assessment";
      }
      if (body?.data) {
        if (!body.analysis_type && body.data.analysis_type) body.analysis_type = body.data.analysis_type;
        if (!body.patient_id && body.data.patient_id) body.patient_id = body.data.patient_id;
        if (!body.app_inputs && body.data.app_inputs) body.app_inputs = body.data.app_inputs;
        if (!body.image_count && body.data.image_count) body.image_count = body.data.image_count;
        if (!body.images && body.data.images) body.images = body.data.images;
        if (!body.results && body.data.results) body.results = body.data.results;
        if (!body.graphs && body.data.graphs) body.graphs = body.data.graphs;
        if (!body.output_images && body.data.output_images) body.output_images = body.data.output_images;
      } else {
        body.data = {
          analysis_type: body.analysis_type,
          patient_id: body.patient_id,
          app_inputs: body.app_inputs,
          image_count: body.image_count || body.images?.length,
          images: body.images,
          results: body.results,
          graphs: body.graphs,
          output_images: body.output_images
        };
      }
      if (body?.meta) {
        if (body.meta.message) body.message = body.meta.message;
        if (body.meta.status !== void 0) body.success = body.meta.status;
      }
      body.is_active = true;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService7.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "WoundHealing Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      if (body?.data) {
        if (!body.analysis_type && body.data.analysis_type) body.analysis_type = body.data.analysis_type;
        if (!body.patient_id && body.data.patient_id) body.patient_id = body.data.patient_id;
        if (!body.app_inputs && body.data.app_inputs) body.app_inputs = body.data.app_inputs;
        if (!body.image_count && body.data.image_count) body.image_count = body.data.image_count;
        if (!body.images && body.data.images) body.images = body.data.images;
        if (!body.results && body.data.results) body.results = body.data.results;
        if (!body.graphs && body.data.graphs) body.graphs = body.data.graphs;
        if (!body.output_images && body.data.output_images) body.output_images = body.data.output_images;
      }
      let query = {};
      if (body?.id) {
        query.id = body.id;
      } else if (body?.category && body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category },
            { "project_id": body?.project_id }
          ]
        };
      } else if (body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category || "efficacy_assessment" },
            { "project_id": body?.project_id }
          ]
        };
      } else {
        query = { "category": body?.category || "efficacy_assessment" };
      }
      let resp = await newService7.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "WoundHealing Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      if (body?.data) {
        if (!body.analysis_type && body.data.analysis_type) body.analysis_type = body.data.analysis_type;
        if (!body.patient_id && body.data.patient_id) body.patient_id = body.data.patient_id;
        if (!body.app_inputs && body.data.app_inputs) body.app_inputs = body.data.app_inputs;
        if (!body.image_count && body.data.image_count) body.image_count = body.data.image_count;
        if (!body.images && body.data.images) body.images = body.data.images;
        if (!body.results && body.data.results) body.results = body.data.results;
        if (!body.graphs && body.data.graphs) body.graphs = body.data.graphs;
        if (!body.output_images && body.data.output_images) body.output_images = body.data.output_images;
      }
      let query = {
        "id": params?.id
      };
      let resp = await newService7.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "WoundHealing Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService7.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "WoundHealing Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService7.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "WoundHealing Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.category === "undefined")) {
        filterQuery.category = query?.category;
      }
      if (!(typeof query?.project_id === "undefined")) {
        filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      if (!(typeof query?.patient_id === "undefined")) {
        filterQuery.patient_id = query?.patient_id;
      }
      if (!(typeof query?.analysis_type === "undefined")) {
        filterQuery.analysis_type = { $regex: query?.analysis_type, $options: "i" };
      }
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let resp = await newService7.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "WoundHealing retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default7 = Handler7;

// apps/backend_service/src/controllers/efficacy_assessment/wound_healing/validation.ts
import { z as z7 } from "zod";
var ImageItemSchema = z7.object({
  image_id: z7.string().optional(),
  sample_group: z7.string().optional(),
  time_hours: z7.number().optional(),
  filename: z7.string().optional(),
  mime_type: z7.string().optional(),
  encoding: z7.string().optional(),
  image_base64: z7.string().optional(),
  width: z7.number().optional(),
  height: z7.number().optional(),
  detected_format: z7.string().optional()
}).passthrough();
var WoundHealingDataSchema = z7.object({
  analysis_type: z7.string().optional(),
  patient_id: z7.string().optional(),
  app_inputs: z7.any().optional(),
  image_count: z7.number().optional(),
  images: z7.array(ImageItemSchema).optional(),
  results: z7.any().optional(),
  graphs: z7.any().optional(),
  output_images: z7.any().optional()
}).passthrough();
var MetaSchema = z7.object({
  status: z7.any().optional(),
  message: z7.string().optional()
}).passthrough();
var WoundHealingSchema = z7.object({
  project_id: z7.union([z7.number(), z7.string()]).optional(),
  category: z7.string().optional(),
  meta: MetaSchema.optional(),
  data: WoundHealingDataSchema.optional(),
  analysis_type: z7.string().optional(),
  patient_id: z7.string().optional(),
  app_inputs: z7.any().optional(),
  image_count: z7.number().optional(),
  images: z7.array(ImageItemSchema).optional(),
  results: z7.any().optional(),
  graphs: z7.any().optional(),
  output_images: z7.any().optional(),
  message: z7.string().optional(),
  success: z7.boolean().optional(),
  status: z7.string().optional(),
  is_active: z7.boolean().optional()
}).passthrough();
function validateWoundHealing(req, res, next) {
  const result = WoundHealingSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/efficacy_assessment/wound_healing/router.ts
var newHandler7 = new handler_default7();
var router9 = express9.Router();
router9.post("/create", authentication, validateWoundHealing, newHandler7.create);
router9.post("/:id/update", authentication, validateWoundHealing, newHandler7.update);
router9.post("/upsert", authentication, validateWoundHealing, newHandler7.upsert);
router9.delete("/:id/delete", authentication, newHandler7.delete);
router9.get("/:id", authentication, newHandler7.get);
router9.get("", authentication, newHandler7.list);
var router_default9 = router9;

// apps/backend_service/src/controllers/efficacy_assessment/barrier_integrity/router.ts
import express10 from "express";

// apps/backend_service/src/controllers/efficacy_assessment/barrier_integrity/service.ts
var BarrierIntegrityService = class {
  async create(data) {
    try {
      return await createDocument(BarrierIntegrity, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async upsert(query, data) {
    try {
      return await upsertDocument(BarrierIntegrity, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async update(query, data) {
    try {
      return await updateDocument(BarrierIntegrity, query, data);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async delete(query) {
    try {
      return await deleteDocument(BarrierIntegrity, query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async get(query) {
    try {
      return await GetBarrierIntegrity(query);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
  async list(query, per_page, page_no, sort) {
    try {
      return await ListBarrierIntegrity(query, per_page, page_no, sort);
    } catch (err) {
      console.log("Error ====>>>", err);
      throw err;
    }
  }
};
var service_default8 = BarrierIntegrityService;

// apps/backend_service/src/controllers/efficacy_assessment/barrier_integrity/handler.ts
var newService8 = new service_default8();
var jsonWebToken8 = new JsonWebToken();
var Handler8 = class {
  async create(req, res, next) {
    try {
      let { body, headers } = req;
      if (headers?.authorization) {
        let token = headers.authorization.split(" ")[1];
        if (token) {
          let decoded = await jsonWebToken8.verify(token);
          body.created_by_id = decoded?.ID;
        }
      }
      body.is_active = true;
      body.createdAt = /* @__PURE__ */ new Date();
      let resp = await newService8.create(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "BarrierIntegrity Created Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async upsert(req, res, next) {
    try {
      let { body } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {};
      if (body?.id) {
        query.id = body.id;
      } else if (body?.category && body?.project_id) {
        query = {
          "$and": [
            { "category": body?.category },
            { "project_id": body?.project_id }
          ]
        };
      } else if (body?.project_id) {
        query = { "project_id": body?.project_id };
      } else {
        query = { "category": body?.category || "efficacy_assessment" };
      }
      let resp = await newService8.upsert(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "BarrierIntegrity Upserted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { body, params } = req;
      body.updatedAt = /* @__PURE__ */ new Date();
      let query = {
        "id": params?.id
      };
      let resp = await newService8.update(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "BarrierIntegrity Updated Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService8.delete(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "BarrierIntegrity Deleted Successfully"));
    } catch (err) {
      next(err);
    }
  }
  async get(req, res, next) {
    try {
      let { params } = req;
      let query = {
        "id": params?.id
      };
      let resp = await newService8.get(query);
      if (resp) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "BarrierIntegrity Retrieved Successfully"));
      } else {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"));
      }
    } catch (err) {
      next(err);
    }
  }
  async list(req, res, next) {
    try {
      let { query } = req;
      let filterQuery = {};
      let and_conditions = [];
      if (!(typeof query?.is_active === "undefined")) {
        filterQuery.is_active = query?.is_active === "true" || query?.is_active === true;
      }
      if (!(typeof query?.category === "undefined")) {
        filterQuery.category = query?.category;
      }
      if (!(typeof query?.project_id === "undefined")) {
        filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
      }
      if (!(typeof query?.status === "undefined")) {
        filterQuery.status = query?.status;
      }
      let sort = { "createdAt": -1 };
      let per_page = parseInt(query?.per_page) || -1;
      let page_no = 1;
      if (!(typeof query?.page_no === "undefined") && parseInt(query?.page_no) !== 0) {
        page_no = parseInt(query?.page_no);
      }
      if (and_conditions.length > 0)
        filterQuery = { "$and": and_conditions };
      let resp = await newService8.list(filterQuery, per_page, page_no, sort);
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "BarrierIntegrity retrieved Successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default8 = Handler8;

// apps/backend_service/src/controllers/efficacy_assessment/barrier_integrity/validation.ts
import { z as z8 } from "zod";
var FormulasSchema = z8.object({
  mean: z8.string().optional(),
  sd: z8.string().optional(),
  percent_integrity: z8.string().optional(),
  percent_barrier_restoration: z8.string().optional()
}).passthrough();
var BarrierResultSchema = z8.object({
  component_name: z8.string().optional(),
  group: z8.string().optional(),
  teer: z8.array(z8.number()).optional(),
  n: z8.number().optional(),
  mean: z8.number().optional(),
  sd: z8.number().optional(),
  percent_integrity: z8.union([z8.number(), z8.null()]).optional(),
  percent_barrier_restoration: z8.union([z8.number(), z8.null()]).optional()
}).passthrough();
var BarrierIntegritySchema = z8.object({
  project_id: z8.union([z8.number(), z8.string()]).optional(),
  category: z8.string().optional().default("efficacy_assessment"),
  assay_type: z8.string().optional(),
  formulas: FormulasSchema.optional(),
  healthy_mean_teer: z8.union([z8.number(), z8.null()]).optional(),
  disease_mean_teer: z8.union([z8.number(), z8.null()]).optional(),
  results: z8.array(BarrierResultSchema).optional(),
  warnings: z8.array(z8.any()).optional(),
  graphs: z8.object({}).passthrough().optional(),
  data: z8.any().optional(),
  meta: z8.any().optional(),
  message: z8.string().optional(),
  success: z8.boolean().optional(),
  status: z8.string().optional(),
  is_active: z8.boolean().optional()
}).passthrough();
function validateBarrierIntegrity(req, res, next) {
  const result = BarrierIntegritySchema.safeParse(req.body);
  if (!result.success) {
    const issues = result?.error?.issues || [];
    return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/efficacy_assessment/barrier_integrity/router.ts
var newHandler8 = new handler_default8();
var router10 = express10.Router();
router10.post("/create", authentication, validateBarrierIntegrity, newHandler8.create);
router10.post("/:id/update", authentication, validateBarrierIntegrity, newHandler8.update);
router10.post("/upsert", authentication, validateBarrierIntegrity, newHandler8.upsert);
router10.delete("/:id/delete", authentication, newHandler8.delete);
router10.get("/:id", authentication, newHandler8.get);
router10.get("", authentication, newHandler8.list);
var router_default10 = router10;

// apps/backend_service/src/controllers/efficacy_assessment/router.ts
import express11 from "express";
var router11 = express11.Router();
router11.use("/wound-healing", router_default9);
router11.use("/wound_healing", router_default9);
router11.use("/barrier-integrity", router_default10);
router11.use("/barrier_integrity", router_default10);
router11.use("/", router_default9);
var router_default11 = router11;

// apps/backend_service/src/controllers/dashboard/router.ts
import express12 from "express";

// apps/backend_service/src/controllers/dashboard/service.ts
var DashboardService = class {
  filterStatusKeys(statusAgg) {
    const status = {};
    for (const item of statusAgg) {
      const rawKey = item._id ? String(item._id).trim() : "unspecified";
      const normalized = rawKey.toLowerCase().replace(/[\s-_]+/g, "_");
      if (normalized.includes("in_progress") || normalized === "active") {
        continue;
      }
      status[rawKey] = (status[rawKey] || 0) + item.count;
    }
    return status;
  }
  mergeStatuses(...statusObjects) {
    const merged = {};
    for (const obj of statusObjects) {
      if (obj) {
        for (const [k, v] of Object.entries(obj)) {
          merged[k] = (merged[k] || 0) + v;
        }
      }
    }
    return merged;
  }
  async getSubmoduleMetric(model, filter = {}) {
    const [total, statusAgg] = await Promise.all([
      model.countDocuments(filter),
      model.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);
    return {
      total,
      status: this.filterStatusKeys(statusAgg)
    };
  }
  async getDashboard(query = {}) {
    try {
      const rawProjectId = query?.project_id || query?.id;
      let assayFilter = {};
      let projectFilter = {};
      if (rawProjectId !== void 0 && rawProjectId !== null && rawProjectId !== "") {
        const numProjectId = !isNaN(Number(rawProjectId)) ? Number(rawProjectId) : rawProjectId;
        assayFilter.project_id = numProjectId;
        projectFilter = {
          "$or": [
            { "id": numProjectId },
            { "project_unique_id": String(rawProjectId) }
          ]
        };
      }
      const [totalProjects, projectStatusAgg] = await Promise.all([
        Project.countDocuments(projectFilter),
        Project.aggregate([
          { $match: projectFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ])
      ]);
      const [
        nociStats,
        growthStats,
        adventitiousStats,
        inducedInflammationStats,
        mycoplasmaStats,
        woundHealingStats,
        barrierIntegrityStats,
        // Distinct project IDs per module
        mechNociProjects,
        mechGrowthProjects,
        safetyAdvProjects,
        safetyInflamProjects,
        safetyMycoProjects,
        effWoundProjects,
        effBarrierProjects
      ] = await Promise.all([
        this.getSubmoduleMetric(NociceptionAssay, assayFilter),
        this.getSubmoduleMetric(GrowthFactorQuantification, assayFilter),
        this.getSubmoduleMetric(AdventitiousAgents, assayFilter),
        this.getSubmoduleMetric(InducedInflammation, assayFilter),
        this.getSubmoduleMetric(MycoplasmaTesting, assayFilter),
        this.getSubmoduleMetric(WoundHealing, assayFilter),
        this.getSubmoduleMetric(BarrierIntegrity, assayFilter),
        // Distinct project queries
        NociceptionAssay.distinct("project_id", assayFilter),
        GrowthFactorQuantification.distinct("project_id", assayFilter),
        AdventitiousAgents.distinct("project_id", assayFilter),
        InducedInflammation.distinct("project_id", assayFilter),
        MycoplasmaTesting.distinct("project_id", assayFilter),
        WoundHealing.distinct("project_id", assayFilter),
        BarrierIntegrity.distinct("project_id", assayFilter)
      ]);
      const mechProjectIds = new Set([...mechNociProjects, ...mechGrowthProjects].filter((id) => id != null));
      const safetyProjectIds = new Set([...safetyAdvProjects, ...safetyInflamProjects, ...safetyMycoProjects].filter((id) => id != null));
      const effProjectIds = new Set([...effWoundProjects, ...effBarrierProjects].filter((id) => id != null));
      const allAssayProjectIds = /* @__PURE__ */ new Set([
        ...mechProjectIds,
        ...safetyProjectIds,
        ...effProjectIds
      ]);
      const assignedConditions = [
        { "assigned_modules.0": { $exists: true } },
        { "modules.0": { $exists: true } },
        { module: { $exists: true, $ne: null, $nin: ["", []] } }
      ];
      if (allAssayProjectIds.size > 0) {
        assignedConditions.push({ id: { $in: Array.from(allAssayProjectIds) } });
      }
      const assignedQuery = Object.keys(projectFilter).length > 0 ? { $and: [projectFilter, { $or: assignedConditions }] } : { $or: assignedConditions };
      const assignedProjectsCount = await Project.countDocuments(assignedQuery);
      const unassignedProjectsCount = Math.max(0, totalProjects - assignedProjectsCount);
      const projectStats = {
        total: totalProjects,
        assigned: assignedProjectsCount,
        unassigned: unassignedProjectsCount,
        status: this.filterStatusKeys(projectStatusAgg)
      };
      const mechanisticAnalysisModule = {
        name: "Mechanistic Analysis",
        total_assays: nociStats.total + growthStats.total,
        status: this.mergeStatuses(nociStats.status, growthStats.status)
      };
      const safetyAssessmentModule = {
        name: "Safety Assessment",
        total_assays: adventitiousStats.total + inducedInflammationStats.total + mycoplasmaStats.total,
        status: this.mergeStatuses(adventitiousStats.status, inducedInflammationStats.status, mycoplasmaStats.status)
      };
      const efficacyAssessmentModule = {
        name: "Efficacy Assessment",
        total_assays: woundHealingStats.total + barrierIntegrityStats.total,
        status: this.mergeStatuses(woundHealingStats.status, barrierIntegrityStats.status)
      };
      const totalAssaysCount = mechanisticAnalysisModule.total_assays + safetyAssessmentModule.total_assays + efficacyAssessmentModule.total_assays;
      return {
        projects: projectStats,
        modules: {
          mechanistic_analysis: mechanisticAnalysisModule,
          safety_assessment: safetyAssessmentModule,
          efficacy_assessment: efficacyAssessmentModule
        },
        submodules: {
          mechanistic_analysis: {
            nociception_assay: {
              label: "Nociception Assay",
              total: nociStats.total,
              status: nociStats.status
            },
            growth_factor_quantification: {
              label: "Growth Factor Quantification",
              total: growthStats.total,
              status: growthStats.status
            }
          },
          safety_assessment: {
            adventitious_agents: {
              label: "Adventitious Agents (Viral Testing)",
              total: adventitiousStats.total,
              status: adventitiousStats.status
            },
            induced_inflammation: {
              label: "Induced Inflammation",
              total: inducedInflammationStats.total,
              status: inducedInflammationStats.status
            },
            mycoplasma_testing: {
              label: "Mycoplasma Testing",
              total: mycoplasmaStats.total,
              status: mycoplasmaStats.status
            }
          },
          efficacy_assessment: {
            wound_healing: {
              label: "Wound Healing (Scratch Assay)",
              total: woundHealingStats.total,
              status: woundHealingStats.status
            },
            barrier_integrity: {
              label: "Barrier Integrity (TEER)",
              total: barrierIntegrityStats.total,
              status: barrierIntegrityStats.status
            }
          }
        },
        total_assays_count: totalAssaysCount
      };
    } catch (err) {
      console.log("Error in DashboardService.getDashboard ====>>>", err);
      throw err;
    }
  }
};
var service_default9 = DashboardService;

// apps/backend_service/src/controllers/dashboard/handler.ts
var newService9 = new service_default9();
var Handler9 = class {
  async getDashboard(req, res, next) {
    try {
      const { query } = req;
      const data = await newService9.getDashboard(query);
      return res.status(200).json(apiResponse.SUCCESS_RESP(data, "Dashboard statistics retrieved successfully"));
    } catch (err) {
      next(err);
    }
  }
};
var handler_default9 = Handler9;

// apps/backend_service/src/controllers/dashboard/router.ts
var newHandler9 = new handler_default9();
var router12 = express12.Router();
router12.get("/", authentication, newHandler9.getDashboard);
router12.get("/stats", authentication, newHandler9.getDashboard);
var router_default12 = router12;

// apps/backend_service/src/controllers/file_upload/router.ts
import express13 from "express";

// apps/backend_service/src/controllers/file_upload/service.ts
import fs2 from "node:fs";
import path3 from "node:path";

// apps/backend_service/src/config/env.ts
import dotenv from "dotenv";
import path2 from "node:path";
import fs from "node:fs";
var envPath = path2.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}
var currentServiceName = process.env.SERVICE_NAME || "backend_service";
var backendServicePort = parseInt(
  process.env.BACKEND_SERVICE_PORT || process.env.PORT || "3001",
  10
);
var GlobalEnv = {
  SERVICE_NAME: currentServiceName,
  PORT: backendServicePort,
  // Common configurations (outside)
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "mongodb+srv://oct_admin:transcell@oct.dmlydcw.mongodb.net/oct",
  JWT_SECRET: process.env.JWT_SECRET || "yNVrBBM+oAOWOEcXPFjJuvXXpUq/4XR1KuSGX/i+slF+oE/geu2uW25PXjfWS9pwjmTry3WXn7q0DH7I+vNSjw==",
  EXPIRY_TIME: process.env.EXPIRY_TIME || "3d",
  SSO_ENCRYPTION_KEY: process.env.SSO_ENCRYPTION_KEY || "0123456789abcdxy0123456789abcdxy",
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10),
  DEFAULT_OTP: process.env.DEFAULT_OTP || "888999",
  B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
  B2_KEY_ID: process.env.B2_KEY_ID || process.env.B2_ACCESS_KEY_ID || "0055e2e57684ed60000000001",
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || process.env.B2_SECRET_ACCESS_KEY || "K005GRuQEdbOc6gpS1jD3BLZoCF8leQ",
  B2_REGION: process.env.B2_REGION || "us-east-005",
  B2_BUCKET: process.env.B2_BUCKET || "transcell",
  ENV_API_URL: process.env.ENV_API_URL || "",
  // Object for each microservice with its own port
  SERVICES: {
    backend_service: {
      PORT: backendServicePort,
      SERVICE_NAME: "backend_service"
    }
  }
};
function setEnv(env_data) {
  const mergedServices = {
    ...GlobalEnv.SERVICES,
    ...env_data.SERVICES || {}
  };
  const serviceName = env_data.SERVICE_NAME || GlobalEnv.SERVICE_NAME || "backend_service";
  const serviceConfig = mergedServices[serviceName];
  const resolvedPort = serviceConfig?.PORT || env_data.PORT || GlobalEnv.PORT;
  GlobalEnv = {
    ...GlobalEnv,
    ...env_data,
    PORT: resolvedPort,
    SERVICES: mergedServices
  };
}

// apps/backend_service/src/controllers/file_upload/service.ts
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".bmp",
  ".tif",
  ".tiff",
  ".ico"
]);
function isImageFilename(filename) {
  const ext = path3.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}
function getMimeTypeFromFilename(filename) {
  const ext = path3.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".bmp":
      return "image/bmp";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}
var FileUploadService = class {
  storage;
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
  async uploadBase64(options) {
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
  async uploadBuffer(options) {
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
  async uploadFolder(options) {
    try {
      const {
        files,
        folderPath,
        folder = "wound_healing",
        expiresIn = 5 * 24 * 3600,
        // 5 days default
        bucket,
        includeBase64 = false,
        outputJsonPath = path3.resolve(process.cwd(), "docs", "uploaded_files.json")
      } = options;
      const itemsToProcess = [];
      if (folderPath && typeof folderPath === "string") {
        const resolvedPath = path3.resolve(folderPath);
        console.log(`
\u{1F50D} [Folder Upload] Scanning directory: "${resolvedPath}"`);
        if (!fs2.existsSync(resolvedPath)) {
          throw new Error(`Directory not found on server: ${folderPath}`);
        }
        const stat = fs2.statSync(resolvedPath);
        if (!stat.isDirectory()) {
          throw new Error(`Path is not a directory: ${folderPath}`);
        }
        const dirEntries = fs2.readdirSync(resolvedPath);
        for (const entry of dirEntries) {
          const fullPath = path3.join(resolvedPath, entry);
          try {
            const fileStat = fs2.statSync(fullPath);
            if (fileStat.isFile() && isImageFilename(entry)) {
              const buffer = fs2.readFileSync(fullPath);
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
      if (files && Array.isArray(files)) {
        for (const f of files) {
          const originalName = f.originalname || f.filename || "image.png";
          const rawBase64 = f.file_base64 || f.fileBase64;
          const buffer = f.buffer;
          const mimeType = f.mimetype || f.mimeType || getMimeTypeFromFilename(originalName);
          itemsToProcess.push({
            filename: originalName,
            buffer,
            fileBase64: rawBase64,
            mimeType,
            size: buffer ? buffer.length : f.size || 0
          });
        }
      }
      if (itemsToProcess.length === 0) {
        throw new Error("No valid image files found to upload.");
      }
      const outputDir = path3.dirname(outputJsonPath);
      if (!fs2.existsSync(outputDir)) {
        fs2.mkdirSync(outputDir, { recursive: true });
      }
      fs2.writeFileSync(outputJsonPath, JSON.stringify([], null, 2), "utf-8");
      console.log(`
========================================================`);
      console.log(`\u{1F680} [Folder Upload] Found ${itemsToProcess.length} images to process`);
      console.log(`\u{1F4C1} Target B2 Folder : "${folder}"`);
      console.log(`\u23F1\uFE0F Expiry Duration  : ${expiresIn} seconds (~${Math.round(expiresIn / 86400)} days)`);
      console.log(`\u{1F4DD} Output JSON File : ${outputJsonPath}`);
      console.log(`========================================================`);
      const results = [];
      let uploadedCount = 0;
      let failedCount = 0;
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        const indexTag = `[${i + 1}/${itemsToProcess.length}]`;
        console.log(`
\u27A1\uFE0F  ${indexTag} Processing: "${item.filename}"`);
        try {
          let base64String = item.fileBase64;
          let itemBuffer = item.buffer;
          if (!base64String && itemBuffer) {
            base64String = itemBuffer.toString("base64");
            const kbSize = (itemBuffer.length / 1024).toFixed(2);
            console.log(`   \u2699\uFE0F  ${indexTag} Converted "${item.filename}" to Base64 (${kbSize} KB)`);
          } else if (base64String && !itemBuffer) {
            const clean = base64String.replace(/^data:[^;]+;base64,/, "");
            itemBuffer = Buffer.from(clean, "base64");
          }
          if (!base64String) {
            throw new Error(`Unable to obtain Base64 data for ${item.filename}`);
          }
          const mimeType = item.mimeType || getMimeTypeFromFilename(item.filename);
          console.log(`   \u2601\uFE0F  ${indexTag} Uploading "${item.filename}" to Backblaze B2...`);
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
            console.error(`   \u274C ${indexTag} Upload failed for "${item.filename}":`, uploadResult.error);
            const failedItem = {
              filename: item.filename,
              mime_type: mimeType,
              size: itemBuffer ? itemBuffer.length : item.size || 0,
              success: false,
              error: uploadResult.error
            };
            results.push(failedItem);
            fs2.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), "utf-8");
            continue;
          }
          uploadedCount++;
          const itemResult = {
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
          fs2.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), "utf-8");
          console.log(`   \u2705 ${indexTag} Uploaded successfully!`);
          console.log(`      \u{1F511} Object Key: ${uploadResult.object_key}`);
          console.log(`      \u{1F517} File URL  : ${uploadResult.file_url}`);
          console.log(`      \u{1F4BE} Pushed to JSON file (${results.length} total saved so far)`);
        } catch (itemErr) {
          failedCount++;
          console.error(`   \u274C ${indexTag} Error processing "${item.filename}":`, itemErr?.message || itemErr);
          const failedItem = {
            filename: item.filename,
            success: false,
            error: itemErr?.message || String(itemErr)
          };
          results.push(failedItem);
          fs2.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), "utf-8");
        }
      }
      console.log(`
========================================================`);
      console.log(`\u{1F3C1} [Folder Upload] Summary:`);
      console.log(`   \u2705 Uploaded : ${uploadedCount}/${itemsToProcess.length}`);
      console.log(`   \u274C Failed   : ${failedCount}/${itemsToProcess.length}`);
      console.log(`   \u{1F4C4} JSON File: ${outputJsonPath}`);
      console.log(`========================================================
`);
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
  async getPresignedDownloadUrl(objectKey, expiresIn = 3600, bucket) {
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
  async getPresignedUploadUrl(options) {
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
  async getFreshUrl(objectKey, expiresIn = 3600, bucket) {
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
  async getFreshUrls(objectKeys, expiresIn = 3600, bucket) {
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
  async deleteFile(objectKey, bucket) {
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
  async refreshFileUrlIfExpiringSoon(doc) {
    if (!doc || !doc.object_key) {
      return doc;
    }
    const now = Date.now();
    const ONE_HOUR_MS = 60 * 60 * 1e3;
    let expiresAtTime;
    if (doc.expires_at) {
      expiresAtTime = new Date(doc.expires_at).getTime();
    } else if (doc.created_at && doc.expires_in) {
      expiresAtTime = new Date(doc.created_at).getTime() + Number(doc.expires_in) * 1e3;
    } else {
      expiresAtTime = now;
    }
    if (expiresAtTime - now < ONE_HOUR_MS) {
      console.log(`
\u{1F504} [Auto-Refresh] File "${doc.filename || doc.object_key}" URL is expiring within 1 hour or expired.`);
      console.log(`   Calling getFreshUrl for object_key: ${doc.object_key}...`);
      const expiresIn = doc.expires_in && Number(doc.expires_in) > 3600 ? Number(doc.expires_in) : 2592e3;
      const freshUrlResult = await this.getFreshUrl(doc.object_key, expiresIn);
      if (freshUrlResult && freshUrlResult.success && freshUrlResult.file_url) {
        const newExpiresAt = new Date(now + expiresIn * 1e3);
        await FileUpload.findOneAndUpdate(
          { id: doc.id },
          {
            $set: {
              file_url: freshUrlResult.file_url,
              expires_at: newExpiresAt,
              expires_in: expiresIn,
              updatedAt: /* @__PURE__ */ new Date()
            }
          }
        );
        console.log(`   \u2705 [Auto-Refresh] Updated MongoDB record ID ${doc.id} with fresh signed URL.`);
        console.log(`   \u{1F517} New URL: ${freshUrlResult.file_url}`);
        console.log(`   \u23F1\uFE0F New expires_at: ${newExpiresAt.toISOString()}
`);
        doc.file_url = freshUrlResult.file_url;
        doc.expires_at = newExpiresAt;
        doc.expires_in = expiresIn;
      } else {
        console.warn(`   \u26A0\uFE0F [Auto-Refresh] Failed to refresh URL for ${doc.object_key}:`, freshUrlResult?.error);
      }
    }
    return doc;
  }
  /**
   * Create single file record in file_upload collection
   */
  async createRecord(data) {
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
  async bulkCreateRecords(dataArray) {
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
  async getRecord(query) {
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
  async listRecords(query, per_page, page_no, sort) {
    try {
      const result = await ListFileUpload(query, per_page, page_no, sort);
      if (result && Array.isArray(result.resp)) {
        result.resp = await Promise.all(
          result.resp.map((doc) => this.refreshFileUrlIfExpiringSoon(doc))
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
  async updateRecord(query, data) {
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
  async deleteRecord(query) {
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
  async upsertRecord(query, data) {
    try {
      return await UpsertFileUpload(query, data);
    } catch (err) {
      console.error("FileUploadService.upsertRecord error ====>", err);
      throw err;
    }
  }
};
var service_default10 = FileUploadService;

// apps/backend_service/src/controllers/file_upload/handler.ts
var newService10 = new service_default10();
var Handler10 = class {
  /**
   * Upload base64 encoded file to Backblaze B2
   */
  async uploadBase64(req, res, next) {
    try {
      const { body } = req;
      const fileBase64 = body.file_base64 || body.fileBase64;
      const filename = body.filename;
      const mimeType = body.mime_type || body.mimeType;
      const folder = body.folder || "uploads";
      const expiresIn = body.expires_in !== void 0 ? Number(body.expires_in) : body.expiresIn !== void 0 ? Number(body.expiresIn) : 3600;
      const bucket = body.bucket;
      const metadata = body.metadata;
      const resp = await newService10.uploadBase64({
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
            { name: "B2UploadError", message: resp.error },
            resp.error || "Failed to upload file to Backblaze B2"
          )
        );
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(resp, "File uploaded to Backblaze B2 successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Upload a folder containing multiple images (e.g. 20-30 images):
   * Converts each image one by one into base64, uploads to Backblaze B2, and returns the signed URL response.
   */
  async uploadFolder(req, res, next) {
    try {
      const files = req.files;
      const body = req.body || {};
      const query = req.query || {};
      const folder = body.folder || query.folder || "wound_healing";
      const folderPath = body.folder_path || body.folderPath || query.folder_path || query.folderPath;
      const expiresIn = body.expires_in !== void 0 ? Number(body.expires_in) : query.expires_in !== void 0 ? Number(query.expires_in) : 5 * 24 * 3600;
      const bucket = body.bucket || query.bucket;
      const includeBase64 = body.include_base64 === true || body.include_base64 === "true" || query.include_base64 === "true";
      const outputJsonPath = body.output_json_path || body.outputJsonPath || query.output_json_path || query.outputJsonPath;
      const bodyFiles = body.files || body.images;
      const resp = await newService10.uploadFolder({
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
    } catch (err) {
      next(err);
    }
  }
  /**
   * Generate presigned download URL for an existing file in B2
   */
  async getPresignedDownloadUrl(req, res, next) {
    try {
      const objectKey = req.body.object_key || req.body.objectKey || req.query.object_key || req.query.objectKey;
      const expiresIn = req.body.expires_in !== void 0 ? Number(req.body.expires_in) : req.query.expires_in !== void 0 ? Number(req.query.expires_in) : 3600;
      const bucket = req.body.bucket || req.query.bucket;
      if (!objectKey) {
        return res.status(400).json(
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "object_key is required" }, "object_key is required")
        );
      }
      const fileUrl = await newService10.getPresignedDownloadUrl(objectKey, expiresIn, bucket);
      return res.status(200).json(
        apiResponse.SUCCESS_RESP({
          object_key: objectKey,
          file_url: fileUrl,
          expires_in: expiresIn
        }, "Presigned download URL generated successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Generate fresh signed URL for an existing file in B2 whenever required
   */
  async getFreshUrl(req, res, next) {
    try {
      const rawKey = req.body?.object_key || req.body?.objectKey || req.query?.object_key || req.query?.objectKey || req.params?.key;
      const objectKey = rawKey ? decodeURIComponent(rawKey) : void 0;
      const expiresIn = req.body?.expires_in !== void 0 ? Number(req.body.expires_in) : req.query?.expires_in !== void 0 ? Number(req.query.expires_in) : 3600;
      const bucket = req.body?.bucket || req.query?.bucket;
      if (!objectKey) {
        return res.status(400).json(
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "object_key is required" }, "object_key is required")
        );
      }
      const resp = await newService10.getFreshUrl(objectKey, expiresIn, bucket);
      if (!resp.success) {
        return res.status(500).json(
          apiResponse.FAILURE_RESP({}, { name: "B2UrlError", message: resp.error }, resp.error || "Failed to generate fresh URL")
        );
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(resp, "Fresh URL generated successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Generate fresh signed URLs for multiple object keys in batch
   */
  async getFreshUrlsBatch(req, res, next) {
    try {
      const { body } = req;
      const objectKeys = body.object_keys || body.objectKeys;
      const expiresIn = body.expires_in !== void 0 ? Number(body.expires_in) : body.expiresIn !== void 0 ? Number(body.expiresIn) : 3600;
      const bucket = body.bucket;
      const results = await newService10.getFreshUrls(objectKeys, expiresIn, bucket);
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(results, "Batch fresh URLs generated successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * View or redirect to file using an on-the-fly fresh signed URL
   * This allows permanent link usage (e.g. in img tags or direct downloads)
   */
  async viewOrRedirectFile(req, res, next) {
    try {
      const rawKey = req.query?.object_key || req.query?.objectKey || req.params?.key;
      const objectKey = rawKey ? decodeURIComponent(rawKey) : void 0;
      const expiresIn = req.query?.expires_in !== void 0 ? Number(req.query.expires_in) : 3600;
      const bucket = req.query?.bucket;
      if (!objectKey) {
        return res.status(400).json(
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "object_key is required" }, "object_key is required")
        );
      }
      const resp = await newService10.getFreshUrl(objectKey, expiresIn, bucket);
      if (!resp.success || !resp.file_url) {
        return res.status(404).json(
          apiResponse.FAILURE_RESP({}, { name: "FileNotFound", message: resp.error || "File not found" }, "File not found")
        );
      }
      return res.redirect(302, resp.file_url);
    } catch (err) {
      next(err);
    }
  }
  /**
   * Generate presigned PUT URL for direct client-to-B2 uploads
   */
  async getPresignedUploadUrl(req, res, next) {
    try {
      const { body } = req;
      const filename = body.filename;
      const mimeType = body.mime_type || body.mimeType;
      const folder = body.folder || "uploads";
      const expiresIn = body.expires_in !== void 0 ? Number(body.expires_in) : body.expiresIn !== void 0 ? Number(body.expiresIn) : 3600;
      const bucket = body.bucket;
      const resp = await newService10.getPresignedUploadUrl({
        filename,
        mimeType,
        folder,
        expiresIn,
        bucket
      });
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(resp, "Presigned upload URL generated successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Delete an object from Backblaze B2
   */
  async deleteFile(req, res, next) {
    try {
      const rawKey = req.body?.object_key || req.body?.objectKey || req.query?.object_key || req.query?.objectKey || req.params?.key;
      const objectKey = rawKey ? decodeURIComponent(rawKey) : void 0;
      const bucket = req.body?.bucket || req.query?.bucket;
      if (!objectKey) {
        return res.status(400).json(
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "object_key is required" }, "object_key is required")
        );
      }
      const resp = await newService10.deleteFile(objectKey, bucket);
      if (!resp.success) {
        return res.status(500).json(
          apiResponse.FAILURE_RESP({}, { name: "B2DeleteError", message: resp.error }, resp.error || "Failed to delete file from B2")
        );
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP({ object_key: objectKey }, "File deleted successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Store single file / image URL metadata in MongoDB file_upload collection
   */
  async create(req, res, next) {
    try {
      const body = req.body;
      if (Array.isArray(body)) {
        const normalizedList = body.map((item) => normalizeFileRecord(item));
        const created2 = await newService10.bulkCreateRecords(normalizedList);
        return res.status(201).json(
          apiResponse.SUCCESS_RESP(created2, `Successfully created ${normalizedList.length} file record(s)`)
        );
      }
      const normalized = normalizeFileRecord(body);
      const created = await newService10.createRecord(normalized);
      return res.status(201).json(
        apiResponse.SUCCESS_RESP(created, "File record stored successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Store multiple file / image URL metadata in bulk in MongoDB file_upload collection
   */
  async bulkCreate(req, res, next) {
    try {
      const body = req.body;
      let items = [];
      let fallbackCategory = "general";
      let fallbackSubCategory;
      let fallbackProjectId;
      if (Array.isArray(body)) {
        items = body;
      } else if (body && typeof body === "object") {
        fallbackCategory = body.category || "general";
        fallbackSubCategory = body.sub_category || body.subCategory;
        fallbackProjectId = body.project_id !== void 0 ? Number(body.project_id) : body.projectId !== void 0 ? Number(body.projectId) : void 0;
        items = body.files || body.images || body.records || [];
      }
      if (!items || items.length === 0) {
        return res.status(400).json(
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "No records provided for bulk create" }, "No records provided")
        );
      }
      const normalizedList = items.map((item) => normalizeFileRecord(item, fallbackCategory, fallbackProjectId, fallbackSubCategory));
      const created = await newService10.bulkCreateRecords(normalizedList);
      return res.status(201).json(
        apiResponse.SUCCESS_RESP(created, `Bulk created ${normalizedList.length} file record(s) successfully`)
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Get a single file record by ID or object_key.
   * Automatically calls getFreshUrl and updates the record in MongoDB if expires_at is less than 1 hour away!
   */
  async get(req, res, next) {
    try {
      const paramId = req.params?.id;
      const queryKey = req.query?.object_key || req.query?.objectKey;
      let query = {};
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
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "File id or object_key is required" }, "Missing identifier")
        );
      }
      const record = await newService10.getRecord(query);
      if (!record) {
        return res.status(404).json(
          apiResponse.FAILURE_RESP({}, { name: "NotFound", message: "File record not found" }, "File record not found")
        );
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(record, "File record retrieved successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * List file records with filtering and pagination.
   * Automatically refreshes any file URLs whose expires_at is less than 1 hour away!
   */
  async list(req, res, next) {
    try {
      const queryParams = req.query || {};
      const pageNo = queryParams.page_no ? Number(queryParams.page_no) : queryParams.page ? Number(queryParams.page) : 1;
      const perPage = queryParams.per_page ? Number(queryParams.per_page) : queryParams.limit ? Number(queryParams.limit) : 20;
      const mongoQuery = {};
      if (queryParams.category) {
        mongoQuery.category = queryParams.category;
      }
      if (queryParams.sub_category || queryParams.subCategory) {
        mongoQuery.sub_category = queryParams.sub_category || queryParams.subCategory;
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
      if (queryParams.is_active !== void 0) {
        mongoQuery.is_active = queryParams.is_active === "true" || queryParams.is_active === true;
      }
      if (queryParams.search || queryParams.filename) {
        const term = queryParams.search || queryParams.filename;
        mongoQuery.filename = { $regex: term, $options: "i" };
      }
      const sort = { createdAt: -1 };
      if (queryParams.sort_by) {
        const order = queryParams.sort_order === "asc" || queryParams.order === "asc" ? 1 : -1;
        sort[queryParams.sort_by] = order;
      }
      const result = await newService10.listRecords(mongoQuery, perPage, pageNo, sort);
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(result, "File records fetched successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Update an existing file record
   */
  async update(req, res, next) {
    try {
      const paramId = req.params?.id;
      const numericId = Number(paramId);
      const query = !isNaN(numericId) ? { id: numericId } : { _id: paramId };
      const updateData = { ...req.body };
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
      const updated = await newService10.updateRecord(query, updateData);
      if (!updated) {
        return res.status(404).json(
          apiResponse.FAILURE_RESP({}, { name: "NotFound", message: "File record not found to update" }, "File record not found")
        );
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(updated, "File record updated successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Delete a file record
   */
  async delete(req, res, next) {
    try {
      const paramId = req.params?.id;
      const numericId = Number(paramId);
      const query = !isNaN(numericId) ? { id: numericId } : { _id: paramId };
      const deleted = await newService10.deleteRecord(query);
      if (!deleted) {
        return res.status(404).json(
          apiResponse.FAILURE_RESP({}, { name: "NotFound", message: "File record not found to delete" }, "File record not found")
        );
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(deleted, "File record deleted successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * Upsert a file record matching query
   */
  async upsert(req, res, next) {
    try {
      const { body } = req;
      const query = {};
      if (body.id) {
        query.id = Number(body.id);
      } else if (body.object_key || body.objectKey) {
        query.object_key = body.object_key || body.objectKey;
      } else {
        return res.status(400).json(
          apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "id or object_key is required for upsert" }, "Missing identifier")
        );
      }
      const normalized = normalizeFileRecord(body);
      const result = await newService10.upsertRecord(query, normalized);
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(result, "File record upserted successfully")
      );
    } catch (err) {
      next(err);
    }
  }
};
function parseTimestampToDate(val) {
  if (val === void 0 || val === null || val === "") return void 0;
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    return new Date(val > 1e10 ? val : val * 1e3);
  }
  const num = Number(val);
  if (!isNaN(num) && /^\d+$/.test(String(val).trim())) {
    return new Date(num > 1e10 ? num : num * 1e3);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? void 0 : d;
}
function normalizeFileRecord(item, fallbackCategory = "general", fallbackProjectId, fallbackSubCategory) {
  const filename = item.filename;
  const object_key = item.object_key || item.objectKey;
  const file_url = item.file_url || item.fileUrl;
  const category = item.category || fallbackCategory;
  const sub_category = item.sub_category || item.subCategory || fallbackSubCategory;
  const mime_type = item.mime_type || item.mimeType;
  const file_type = item.file_type || item.fileType;
  const size = item.size !== void 0 ? Number(item.size) : void 0;
  const expires_in = item.expires_in !== void 0 ? Number(item.expires_in) : item.expiresIn !== void 0 ? Number(item.expiresIn) : 2592e3;
  const project_id = item.project_id !== void 0 ? Number(item.project_id) : item.projectId !== void 0 ? Number(item.projectId) : fallbackProjectId;
  const createdAt = parseTimestampToDate(item.created_at ?? item.createdAt) || /* @__PURE__ */ new Date();
  let expiresAt = parseTimestampToDate(item.expires_at ?? item.expiresAt);
  if (!expiresAt && expires_in) {
    expiresAt = new Date(createdAt.getTime() + expires_in * 1e3);
  }
  return {
    filename,
    object_key,
    file_url,
    category,
    sub_category,
    file_type,
    mime_type,
    size,
    expires_in,
    project_id,
    created_at: createdAt,
    expires_at: expiresAt,
    status: item.status || "active",
    is_active: item.is_active !== void 0 ? Boolean(item.is_active) : true,
    metadata: item.metadata || {}
  };
}
var handler_default10 = Handler10;

// apps/backend_service/src/controllers/file_upload/validation.ts
import { z as z9 } from "zod";
import multer from "multer";
var memoryStorage = multer.memoryStorage();
var multerUploader = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB per file limit
    files: 100
    // up to 100 images
  }
});
var uploadFolderFiles = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    multerUploader.any()(req, res, (err) => {
      if (err) {
        res.status(400).json(
          apiResponse.FAILURE_RESP(
            {},
            { name: "MulterUploadError", message: err.message },
            err.message || "Error processing multipart files"
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
function validateUploadFolder(req, res, next) {
  const hasMultipartFiles = Array.isArray(req.files) && req.files.length > 0;
  const hasFolderPath = typeof req.body?.folder_path === "string" && req.body.folder_path.trim().length > 0 || typeof req.body?.folderPath === "string" && req.body.folderPath.trim().length > 0 || typeof req.query?.folder_path === "string" && req.query.folder_path.trim().length > 0 || typeof req.query?.folderPath === "string" && req.query.folderPath.trim().length > 0;
  const hasBodyFiles = Array.isArray(req.body?.files) && req.body.files.length > 0 || Array.isArray(req.body?.images) && req.body.images.length > 0;
  if (!hasMultipartFiles && !hasFolderPath && !hasBodyFiles) {
    return res.status(400).json(
      apiResponse.FAILURE_RESP(
        {},
        {
          name: "ValidationError",
          message: "Please provide images via multipart/form-data (key: files or images), a local folder_path, or an array of files in JSON"
        },
        "No images or folder provided"
      )
    );
  }
  return next();
}
var UploadBase64Schema = z9.object({
  file_base64: z9.string().min(1, "file_base64 is required").optional(),
  fileBase64: z9.string().min(1, "fileBase64 is required").optional(),
  filename: z9.string().min(1, "filename is required"),
  mime_type: z9.string().optional(),
  mimeType: z9.string().optional(),
  folder: z9.string().optional().default("uploads"),
  expires_in: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expiresIn: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  bucket: z9.string().optional(),
  metadata: z9.record(z9.string(), z9.string()).optional()
}).refine((data) => !!(data.file_base64 || data.fileBase64), {
  message: "Either file_base64 or fileBase64 is required",
  path: ["file_base64"]
});
var PresignedDownloadSchema = z9.object({
  object_key: z9.string().min(1, "object_key is required").optional(),
  objectKey: z9.string().min(1, "objectKey is required").optional(),
  expires_in: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expiresIn: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  bucket: z9.string().optional()
}).refine((data) => !!(data.object_key || data.objectKey), {
  message: "Either object_key or objectKey is required",
  path: ["object_key"]
});
var PresignedUploadSchema = z9.object({
  filename: z9.string().min(1, "filename is required"),
  mime_type: z9.string().optional(),
  mimeType: z9.string().optional(),
  folder: z9.string().optional().default("uploads"),
  expires_in: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expiresIn: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  bucket: z9.string().optional()
});
var DeleteFileSchema = z9.object({
  object_key: z9.string().min(1, "object_key is required").optional(),
  objectKey: z9.string().min(1, "objectKey is required").optional(),
  bucket: z9.string().optional()
});
var GetFreshUrlsBatchSchema = z9.object({
  object_keys: z9.array(z9.string().min(1)).min(1, "object_keys array must not be empty").optional(),
  objectKeys: z9.array(z9.string().min(1)).min(1, "objectKeys array must not be empty").optional(),
  expires_in: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expiresIn: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  bucket: z9.string().optional()
}).refine((data) => !!(data.object_keys && data.object_keys.length > 0 || data.objectKeys && data.objectKeys.length > 0), {
  message: "Either object_keys or objectKeys array is required",
  path: ["object_keys"]
});
function validateUploadBase64(req, res, next) {
  const result = UploadBase64Schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues || [];
    return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}
function validateGetFreshUrl(req, res, next) {
  const result = PresignedDownloadSchema.safeParse({ ...req.body, ...req.query });
  if (!result.success) {
    const issues = result.error.issues || [];
    return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}
var SingleFileRecordSchema = z9.object({
  filename: z9.string().min(1, "filename is required"),
  object_key: z9.string().min(1, "object_key is required").optional(),
  objectKey: z9.string().min(1, "objectKey is required").optional(),
  file_url: z9.string().min(1, "file_url is required").optional(),
  fileUrl: z9.string().min(1, "fileUrl is required").optional(),
  category: z9.string().optional().default("general"),
  sub_category: z9.string().optional(),
  subCategory: z9.string().optional(),
  file_type: z9.string().optional(),
  fileType: z9.string().optional(),
  mime_type: z9.string().optional(),
  mimeType: z9.string().optional(),
  project_id: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  projectId: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expires_in: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expiresIn: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  size: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  created_at: z9.union([z9.number(), z9.string(), z9.date()]).optional(),
  createdAt: z9.union([z9.number(), z9.string(), z9.date()]).optional(),
  expires_at: z9.union([z9.number(), z9.string(), z9.date()]).optional(),
  expiresAt: z9.union([z9.number(), z9.string(), z9.date()]).optional(),
  status: z9.string().optional(),
  is_active: z9.boolean().optional(),
  metadata: z9.record(z9.string(), z9.any()).optional()
}).refine((data) => !!(data.object_key || data.objectKey), {
  message: "Either object_key or objectKey is required",
  path: ["object_key"]
}).refine((data) => !!(data.file_url || data.fileUrl), {
  message: "Either file_url or fileUrl is required",
  path: ["file_url"]
});
function validateCreateRecord(req, res, next) {
  const isArray = Array.isArray(req.body);
  if (isArray) {
    if (req.body.length === 0) {
      return res.status(400).json(apiResponse.FAILURE_RESP({}, { name: "ValidationError", message: "Request array cannot be empty" }, "Empty array provided"));
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
    return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}
function validateBulkCreateRecords(req, res, next) {
  let items = [];
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
        { name: "ValidationError", message: "Body must be an array or contain a files/images/records array" },
        "Invalid bulk create payload"
      )
    );
  }
  if (items.length === 0) {
    return res.status(400).json(
      apiResponse.FAILURE_RESP(
        {},
        { name: "ValidationError", message: "Array of records cannot be empty" },
        "Empty bulk create payload"
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
var UpdateFileRecordSchema = z9.object({
  filename: z9.string().optional(),
  object_key: z9.string().optional(),
  file_url: z9.string().optional(),
  category: z9.string().optional(),
  sub_category: z9.string().optional(),
  subCategory: z9.string().optional(),
  file_type: z9.string().optional(),
  mime_type: z9.string().optional(),
  project_id: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  expires_in: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  size: z9.union([z9.number(), z9.string().regex(/^\d+$/).transform(Number)]).optional(),
  created_at: z9.union([z9.number(), z9.string(), z9.date()]).optional(),
  expires_at: z9.union([z9.number(), z9.string(), z9.date()]).optional(),
  status: z9.string().optional(),
  is_active: z9.boolean().optional(),
  metadata: z9.record(z9.string(), z9.any()).optional()
});
function validateUpdateRecord(req, res, next) {
  const result = UpdateFileRecordSchema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues || [];
    return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
  }
  return next();
}

// apps/backend_service/src/controllers/file_upload/router.ts
var newHandler10 = new handler_default10();
var router13 = express13.Router();
router13.post("/upload", validateUploadBase64, newHandler10.uploadBase64);
router13.post("/upload-folder", uploadFolderFiles, validateUploadFolder, newHandler10.uploadFolder);
router13.post("/get-url", validateGetFreshUrl, newHandler10.getFreshUrl);
router13.post("/create", validateCreateRecord, newHandler10.create);
router13.post("/bulk-create", validateBulkCreateRecords, newHandler10.bulkCreate);
router13.get("", newHandler10.list);
router13.get("/:id", newHandler10.get);
router13.post("/:id/update", validateUpdateRecord, newHandler10.update);
router13.delete("/:id/delete", newHandler10.delete);
var router_default13 = router13;

// apps/backend_service/src/router.ts
var router14 = express14.Router();
router14.use("/project", router_default);
router14.use("/dashboard", router_default12);
router14.use("/file-upload", router_default13);
router14.use("/file_upload", router_default13);
router14.use("/growth-factor-quantification", router_default2);
router14.use("/mechanistic-analysis", router_default4);
router14.use("/nociception-assay", router_default3);
router14.use("/adventitious-agents", router_default5);
router14.use("/adventitious_agents", router_default5);
router14.use("/safety-assessment", router_default8);
router14.use("/safety_assessment", router_default8);
router14.use("/induced-inflammation", router_default6);
router14.use("/induced_inflammation", router_default6);
router14.use("/mycoplasma-testing", router_default7);
router14.use("/mycoplasma_testing", router_default7);
router14.use("/wound-healing", router_default9);
router14.use("/wound_healing", router_default9);
router14.use("/barrier-integrity", router_default10);
router14.use("/barrier_integrity", router_default10);
router14.use("/efficacy-assessment", router_default11);
router14.use("/efficacy_assessment", router_default11);
var router_default14 = router14;

// apps/backend_service/src/main.ts
async function fetchEnvByApi(apiUrl) {
  const url = apiUrl || GlobalEnv.ENV_API_URL || process.env.ENV_API_URL;
  if (!url) {
    console.log(`\u2139\uFE0F [Config] No ENV_API_URL provided; using local .env data.`);
    return;
  }
  try {
    console.log(`\u{1F4E1} [Config] Fetching environment configuration from API: ${url}...`);
    const response = await axios2.get(url, { timeout: 8e3 });
    const payload = response.data?.data || response.data;
    if (payload && typeof payload === "object") {
      setEnv(payload);
      console.log(`\u2705 [Config] Successfully fetched env by API and updated env.ts`);
      console.log(`   Service: '${GlobalEnv.SERVICE_NAME}', Port: ${GlobalEnv.PORT}`);
    }
  } catch (err) {
    console.warn(`\u26A0\uFE0F [Config] Failed to fetch env from API (${err.message}). Using local fallback.`);
  }
}
async function init(app2) {
  function customLogger(tokens, req, res) {
    const date = (/* @__PURE__ */ new Date()).toISOString();
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const httpVersion = "HTTP/" + req.httpVersion;
    const statusCode = res.statusCode;
    return `date: ${date}, ${method} ${url} ${httpVersion} ${statusCode}`;
  }
  try {
    await fetchEnvByApi();
    console.log("Backend_Application: ", GlobalEnv);
    const nums = await generateRandomAlphanumeric(8);
    console.log(`Generated Random String: ${nums}`);
    if (GlobalEnv?.DB_CONNECTION_STRING) {
      console.log("Connecting to Database...");
      await connectWithRetry(GlobalEnv?.DB_CONNECTION_STRING);
      console.log("Database Connection Established");
    }
    app2.use(cors());
    app2.use(cookieParser());
    app2.use(express15.json({ limit: "50mb" }));
    app2.use(express15.urlencoded({ limit: "50mb", extended: true }));
    app2.use((err, req, res, next) => {
      if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
          meta: {
            status: false,
            message: "Invalid JSON format: In Windows file paths, use forward slashes '/' (e.g. 'C:/Users/...') instead of unescaped backslashes '\\'."
          },
          error: {
            name: "JSONParseError",
            message: err.message
          }
        });
      }
      next(err);
    });
    app2.use(logger(customLogger));
    app2.get("/", (req, res) => {
      res.send({ message: "Backend Application Working fine" });
    });
    app2.get("/api/v1/oct/backend/env", async (req, res) => {
      const externalApiUrl = req.query.api_url;
      if (externalApiUrl) {
        await fetchEnvByApi(externalApiUrl);
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(GlobalEnv, "Environment configuration details fetched successfully")
      );
    });
    app2.use("/api/v1/oct/backend", router_default14);
    app2.use("/api/v1/transcell/backend", router_default14);
    app2.use((req, res) => {
      res.status(404).json({
        "meta": {
          "status": false,
          "message": "page not found"
        },
        "error": {
          "name": "page not found",
          "message": "Page not found"
        }
      });
    });
    if (!process.env.VERCEL) {
      const server = app2.listen(GlobalEnv?.PORT || 3001, () => {
        console.log(`Backend_Application server listening on port : ${GlobalEnv?.PORT || 3001}`);
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(`
\u274C Port ${GlobalEnv?.PORT || 3001} is already in use by another process.`);
          console.error(`Please kill the process holding port ${GlobalEnv?.PORT || 3001} or change the PORT in config/env.ts.
`);
        } else {
          console.error("Server error =====>>>>", err);
        }
        process.exit(1);
      });
    }
  } catch (err) {
    console.log("App Error =====>>>>", err);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}
var app = express15();
var initPromise = init(app);
var main_default = app;

// scripts/vercel-entry.ts
async function handler(req, res) {
  if (initPromise) {
    await initPromise;
  }
  return main_default(req, res);
}
export {
  handler as default
};
