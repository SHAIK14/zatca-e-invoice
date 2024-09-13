const mongoose = require("mongoose");

const submissionScheduleSchema = new mongoose.Schema({
  scheduleType: { type: String, enum: ["auto", "manual"], required: true },
  hour: { type: Number, required: true },
  minute: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("SubmissionSchedule", submissionScheduleSchema);
