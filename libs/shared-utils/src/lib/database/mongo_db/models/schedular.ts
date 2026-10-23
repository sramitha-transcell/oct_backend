import mongoose from "mongoose";

const schedularSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String },
    code: { type: String, unique: true },
    description: { type: String },
    scheduling_time: {
        frequency_type: { type: String }, // e.g. 'MINUTE', 'HOUR', 'WEEKDAYS'
        time: { type: Number },
        hours: [{ type: Number }],
        weekdays: [{ type: Number }]
    },
    type: { type: String },
    is_active: { type: Boolean },
    last_run_time: { type: Date }
  }, 
  { timestamps: true }
);

const Schedular = mongoose.model('schedular', schedularSchema);

export { Schedular };
