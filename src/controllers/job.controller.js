import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Job } from "../models/job.model.js"
import { Category } from "../models/category.model.js"
import { JobRequest } from "../models/jobRequest.model.js"




// job controllers

const getAllJobCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().select("-createdAt -updatedAt")
    return res.status(200)
        .json(
            new ApiResponse(200, categories, "all categories fetched successfully")
        )
})



const creatNewJob = asyncHandler(async (req, res) => {
    const user = req.user;
    const { title, description, budget, categoryId, startDate, endDate } = req.body;

    // Validate category if provided
    if (categoryId) {
        const isValidCategory = await Category.findById(categoryId);
        if (!isValidCategory) {
            throw new ApiError(400, "Invalid category");
        }
    }

    // Basic field validation
    if (!title?.trim() || !description?.trim() || budget === undefined) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate startDate and endDate (if provided)
    let parsedStartDate = null;
    let parsedEndDate = null;

    if (startDate) {
        const date = new Date(startDate);
        if (isNaN(date)) {
            throw new ApiError(400, "Invalid start date format");
        }
        if (date < new Date()) {
            throw new ApiError(400, "Start date cannot be in the past");
        }
        parsedStartDate = date;
    }

    if (endDate) {
        const date = new Date(endDate);
        if (isNaN(date)) {
            throw new ApiError(400, "Invalid end date format");
        }
        parsedEndDate = date;
    }

    if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
        throw new ApiError(400, "End date cannot be earlier than start date");
    }

    // Create job
    const job = await Job.create({
        title: title.trim(),
        description: description.trim(),
        clientId: user._id,
        categoryId: categoryId || null,
        budget,
        startDate: parsedStartDate,
        endDate: parsedEndDate
    });

    if (!job) {
        throw new ApiError(500, "Something went wrong while posting the job");
    }

    return res.status(201).json(
        new ApiResponse(201, job, "Job posted successfully")
    );
});


const deleteJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;


    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Optional: Only allow client who created the job to delete it
    if (job.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this job");
    }

    // Delete job
    await job.deleteOne();

    // Optional: Delete all job requests for this job
    await JobRequest.deleteMany({ jobId });

    return res.status(200).json(
        new ApiResponse(200, {}, "Job deleted successfully")
    );
});

const updateJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { title, description, budget, categoryId, startDate, endDate } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Optional: Only allow client who created the job to update it
    if (job.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this job");
    }

    // Update only provided fields
    if (title) job.title = title.trim();
    if (description) job.description = description.trim();
    if (budget !== undefined) job.budget = budget;
    if (categoryId) job.categoryId = categoryId;
    // if (status) job.status = status;
    if (startDate) job.startDate = new Date(startDate);
    if (endDate) job.endDate = new Date(endDate);

    await job.save();

    return res.status(200).json(
        new ApiResponse(200, job, "Job updated successfully")
    );
});

// getAlljobs
const getAllJobs = asyncHandler(async(req, res) => {
    const allJobs = await Job.find();
    return res.status(200)
    .json(
        new ApiResponse(200, allJobs, "all jobs details fetched successfully")
    )
})



// client controllers

const getClientPostedJobs = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const jobs = await Job.find({ clientId: userId })
        .select("title budget status")
        .sort({ createdAt: -1 })

    return res.status(200)
        .json(
            new ApiResponse(200, jobs, "all jobs are fetched successfully posted by client")
        )

})


const acceptJobRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    // Find the job request
    const jobRequest = await JobRequest.findById(requestId);
    if (!jobRequest) {
        throw new ApiError(404, "Job request not found");
    }

    // Fetch the job to verify the client
    const job = await Job.findById(jobRequest.jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Only the client who created the job can accept requests
    if (job.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to accept this job request");
    }


    jobRequest.status = "accepted";
    await jobRequest.save();


    await Job.findByIdAndUpdate(jobRequest.jobId, { status: "in_progress" });


    await JobRequest.updateMany(
        { jobId: jobRequest.jobId, _id: { $ne: requestId } },
        { $set: { status: "rejected" } }
    );

    return res.status(200).json(
        new ApiResponse(200, jobRequest, "Job request accepted successfully")
    );
});

const rejectJobRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    // Find the job request
    const jobRequest = await JobRequest.findById(requestId);
    if (!jobRequest) {
        throw new ApiError(404, "Job request not found");
    }

    const job = await Job.findById(jobRequest.jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Only the client who created the job can reject requests
    if (job.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to reject this job request");
    }

    // Update the status to rejected
    jobRequest.status = "rejected";
    await jobRequest.save();

    return res.status(200).json(
        new ApiResponse(200, jobRequest, "Job request rejected successfully")
    );
});


// freelancer controllers

// getAllJobs
const getAllJobsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params; // or req.params if using /jobs/category/:categoryId

    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    // Validate category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        throw new ApiError(404, "Category not found");
    }

    // Fetch all jobs in this category
    const jobs = await Job.find({ categoryId })
        .populate("clientId", "name email") // optional: show client info
        .sort({ createdAt: -1 }); // latest first

    return res.status(200).json(
        new ApiResponse(200, jobs, "Jobs fetched successfully")
    );
});



const createJobRequest = asyncHandler(async (req, res) => {
    const { jobId } = req.body;
    const freelancerId = req.user._id; // current logged-in freelancer

    // Validate job existence
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check if freelancer is trying to apply on their own job
    if (job.clientId.toString() === freelancerId.toString()) {
        throw new ApiError(400, "You cannot request your own job");
    }

    // Check job status (can't request closed/completed jobs)
    if (["completed", "cancelled"].includes(job.status)) {
        throw new ApiError(400, `Cannot request this job. Current status: ${job.status}`);
    }

    // Check if this freelancer has already requested
    const existingRequest = await JobRequest.findOne({
        jobId,
        freelancerId
    });

    if (existingRequest) {
        throw new ApiError(400, "You have already requested this job");
    }

    // Create job request
    const jobRequest = await JobRequest.create({
        jobId,
        clientId: job.clientId,
        freelancerId,
        status: "pending"
    });

    return res.status(201).json(
        new ApiResponse(201, jobRequest, "Job request created successfully")
    );
});


// getRequestedJobs
const getRequestedJobs = asyncHandler(async (req, res) => {
    const freelancerId = req.user._id; // Current logged-in freelancer

    // Find all job requests by this freelancer
    const jobRequests = await JobRequest.find({ freelancerId })
        .populate({
            path: "jobId",
            populate: { path: "clientId", select: "name email" }, // Get client info too
            select: "title description budget status startDate endDate"
        })
        .sort({ createdAt: -1 }); // Latest requests first

    // If no requests found
    if (!jobRequests || jobRequests.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No job requests found")
        );
    }

    // Extract only job details with request status
    const requestedJobs = jobRequests.map(req => ({
        requestId: req._id,
        status: req.status,
        job: req.jobId
    }));

    return res.status(200).json(
        new ApiResponse(200, requestedJobs, "Requested jobs fetched successfully")
    );
});


// common controllers


const getJobDetails = asyncHandler(async (req, res) => {
    // const jobId = req.query.id;
    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(400, "Job ID is required");
    }

    // Validate job existence
    const job = await Job.findById(jobId)
        .populate("categoryId", "name description")
        .populate("clientId", "-password -refreshToken");

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Find all freelancer requests for this job
    const jobRequests = await JobRequest.find({ jobId })
        .populate("freelancerId", "-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { job, jobRequests }, "Job details fetched successfully")
    );
});

// cancellJob
const cancelJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // If client cancels
    if (job.clientId.toString() === userId.toString()) {
        if (["completed", "cancelled"].includes(job.status)) {
            throw new ApiError(400, `Job is already ${job.status}`);
        }
    }
    // If freelancer cancels
    else {
        const acceptedRequest = await JobRequest.findOne({
            jobId,
            freelancerId: userId,
            status: "accepted"
        });
        if (!acceptedRequest) {
            throw new ApiError(403, "You are not authorized to cancel this job");
        }
        if (job.status !== "in_progress") {
            throw new ApiError(400, "Job must be in progress to cancel as freelancer");
        }
    }

    // Cancel job
    job.status = "cancelled";
    await job.save();

    // Reject all requests
    await JobRequest.updateMany(
        { jobId },
        { $set: { status: "rejected" } }
    );

    return res.status(200).json(
        new ApiResponse(200, job, "Job cancelled successfully")
    );
});



// jobcompleted

const completeJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check if user is either client or accepted freelancer
    const isClient = job.clientId.toString() === userId.toString();
    const isFreelancer = await JobRequest.findOne({
        jobId,
        freelancerId: userId,
        status: "accepted"
    });

    if (!isClient && !isFreelancer) {
        throw new ApiError(403, "You are not authorized to complete this job");
    }

    if (job.status !== "in_progress") {
        throw new ApiError(400, "Only jobs in progress can be marked as completed");
    }

    // Mark as completed
    job.status = "completed";
    // job.completedAt = new Date(); // Add this field to your schema if needed
    await job.save();

    return res.status(200).json(
        new ApiResponse(200, job, "Job marked as completed successfully")
    );
});



export {
    getAllJobCategories,
    creatNewJob,
    deleteJob,
    updateJob,
    getAllJobs,
    getClientPostedJobs,
    acceptJobRequest,
    rejectJobRequest,
    getAllJobsByCategory,
    createJobRequest,
    getRequestedJobs,
    getJobDetails,
    cancelJob,
    completeJob
}