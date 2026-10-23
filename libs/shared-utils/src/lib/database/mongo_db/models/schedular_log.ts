import mongoose from "mongoose";

const schedularLogSchema = new mongoose.Schema(
  {
    schedular_id: { type: String },
    start_time: { type: Date },
    end_time: { type: Date },
    status: { type: String } // 'in-progress', 'completed', 'failure'
  }, 
  { timestamps: true }
);

const SchedularLog = mongoose.model('schedular_log', schedularLogSchema);

export { SchedularLog };
