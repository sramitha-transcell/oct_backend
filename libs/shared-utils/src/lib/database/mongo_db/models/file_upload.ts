//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const fileUploadSchema = new mongoose.Schema(
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
    expires_in: { type: Number, default: 2592000 },
    size: { type: Number },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date },
    status: { type: String, default: "active" },
    is_active: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true, strict: false }
);

function detectFileType(filename?: string, mimeType?: string): string {
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

fileUploadSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
  if (!this.created_at) {
    this.created_at = new Date();
  }
  if (!this.file_type) {
    this.file_type = detectFileType(this.filename, this.mime_type);
  }
  if (!this.expires_at && this.expires_in) {
    this.expires_at = new Date(this.created_at.getTime() + this.expires_in * 1000);
  }
});

fileUploadSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1, sub_category: 1, object_key: 1, expires_at: 1 });
fileUploadSchema.plugin(mongoosePaginate);

const FileUpload = mongoose.model(
  'file_upload',
  fileUploadSchema,
  'file_upload'
);

export { FileUpload, detectFileType };
export default FileUpload;
