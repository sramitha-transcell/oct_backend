//@ts-nocheck
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        role: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        isUsed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for auto-deletion of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('otp', otpSchema);

export { OTP };
