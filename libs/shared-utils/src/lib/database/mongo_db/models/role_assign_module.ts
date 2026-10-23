//@ts-nocheck
import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    role_id: { type: String },
    module_id: { type: String },
    module_name: { type: String },
    company_id: { type: String },
    is_view: { type: Boolean },
    is_edit: { type: Boolean },
    is_delete: { type: Boolean }
  }, 
  { timestamps: true }
);

rolePermissionSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
      this.id = latestDocument ? latestDocument.id + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const RolePermission = mongoose.model('role_permission', rolePermissionSchema);

export { RolePermission };


