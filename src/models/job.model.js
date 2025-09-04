import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    budget: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: "open"
    },

    startDate: {
      type: Date,  // When the job is planned to start
      default: null
    },

    endDate: {
      type: Date,  // When the job is expected to end
      default: null
    }

  },
  { timestamps: true }
);


export const Job = mongoose.model("Job", jobSchema)