//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchemas = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        user_name: { type: String, unique: true, sparse: true, default: "" },
        password: { type: String, default: "" },
        email: { type: String, default: "" },
        mobile_number: { type: String, default: "" },
        role:{type:Object,default:{}},
        profile_image: { type: String, default: "" },
        scellcare_id: { type: Number },
        pregen_id: { type: Number },
        transvidan_id: { type: Number },
        created_by_id: { type: Number },
        is_active:{ type: Boolean}
    },
    { _id: true, timestamps: true }
)
 userSchemas.pre("save", async function () {
    if (this.isNew && this.id == null) {
        const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
        this.id = latestDocument ? latestDocument.id + 1 : 1;
    }
});

 userSchemas.index({ id: 1, createdAt: -1 }); userSchemas.plugin(mongoosePaginate)

const User = mongoose.model('users', userSchemas, "users")

export { User };