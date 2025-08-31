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
    }
  },
  { timestamps: true }
);


export const Job = mongoose.model("Job", jobSchema)