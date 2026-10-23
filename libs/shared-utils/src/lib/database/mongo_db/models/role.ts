//@ts-nocheck
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String },
    code: { type: String },
    description: { type: String },
    is_active: { type: Boolean },
    company_id: { type: String },
    created_by_id: { type: String },
    updated_by_id: { type: String }
  }, 
  { timestamps: true } // This will add createdAt and updatedAt automatically
);

const Role = mongoose.model('role', roleSchema);

export { Role };



