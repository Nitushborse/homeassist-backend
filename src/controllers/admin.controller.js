// controllers/admin.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";

// Dashboard Stats
const getAdminDashboardStats = asyncHandler(async (req, res) => {
    try {
        // --- Job stats ---
        const totalJobs = await Job.countDocuments();
        const openJobs = await Job.countDocuments({ status: "open" });
        const inProgressJobs = await Job.countDocuments({ status: "in_progress" });
        const completedJobs = await Job.countDocuments({ status: "completed" });
        const cancelledJobs = await Job.countDocuments({ status: "cancelled" });

        // --- User stats ---
        const totalClients = await User.countDocuments({ role: "client" });
        const totalFreelancers = await User.countDocuments({ role: "freelancer" });
        const totalAdmins = await User.countDocuments({ role: "admin" });

        return res.status(200).json(
            new ApiResponse(200, {
                jobs: {
                    total: totalJobs,
                    open: openJobs,
                    in_progress: inProgressJobs,
                    completed: completedJobs,
                    cancelled: cancelledJobs
                },
                users: {
                    clients: totalClients,
                    freelancers: totalFreelancers,
                    admins: totalAdmins
                }
            }, "Admin stats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to fetch admin stats");
    }
});

// List of Clients
const getAllClients = asyncHandler(async (req, res) => {
    const clients = await User.find({ role: "client" }).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, clients, "Clients fetched successfully")
    );
});

// List of Freelancers
const getAllFreelancers = asyncHandler(async (req, res) => {
    const freelancers = await User.find({ role: "freelancer" }).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, freelancers, "Freelancers fetched successfully")
    );
});

// List of Admins
const getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await User.find({ role: "admin" }).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, admins, "Admins fetched successfully")
    );
});

export {
    getAdminDashboardStats,
    getAllClients,
    getAllFreelancers,
    getAllAdmins
};
