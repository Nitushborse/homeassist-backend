// import { Router } from "express"
// import verifyJwt from "../middlewares/auth.middleware.js"
// import authorizeRoles from "../middlewares/authorizedRoles.middleware.js"
// import { 
//     getAllJobCategories,
//     creatNewJob,
//     deleteJob,
//     updateJob,
//     getAllJobs,
//     getClientPostedJobs,
//     getFulljobDetailsToClient,
//     acceptJobRequest,
//     rejectJobRequest,
//     getAllJobsByCategory,
//     getFulljobDetailsToFreelancer,
//     createJobRequest,
//     getRequestedJobs,
//     getJobDetails,
//     cancelJob,
//     completeJob
// } from "../controllers/job.controller.js"



// const router = Router()

// router.route("/getallcategories").get(getAllJobCategories)

// // secure route
// // jobs routes
// router.route("/postjob").post(verifyJwt,creatNewJob)
// router.route("/getalljobs").get(verifyJwt, getAllJobs)
// router.route("/updatejob/:jobId").patch(verifyJwt, updateJob)
// router.route("/deletejob/:jobId").delete(verifyJwt, deleteJob)


// // client routes
// router.route("/getclientjobs").get(verifyJwt,getClientPostedJobs)
// router.route("/getallrequests/:jobId").get(verifyJwt, getFulljobDetailsToClient)
// router.route("/acceptjobrequest/:requestId").patch(verifyJwt,  acceptJobRequest)
// router.route("/rejectjobrequest/:requestId").patch(verifyJwt, rejectJobRequest)

// // freelancer routes
// router.route("/getjobsbycategory/:categoryId").get(verifyJwt, getAllJobsByCategory)
// router.route("/getfulldetails/:jobId").get(verifyJwt, getFulljobDetailsToFreelancer)
// router.route("/createjobrequest").post(verifyJwt,createJobRequest)
// router.route("/getrequestedjobs").get(verifyJwt, getRequestedJobs)

// // common routes
// router.route("/getjobdetails/:jobId").get(verifyJwt, getJobDetails)// common
// router.route("/canceljob/:jobId").patch(verifyJwt, cancelJob)
// router.route("/jobcompleted/:jobId").patch(verifyJwt, completeJob)

// export default router


import { Router } from "express"
import verifyJwt from "../middlewares/auth.middleware.js"
import {authorizeRoles} from "../middlewares/authorizedRoles.middleware.js"
import { 
    getAllJobCategories,
    creatNewJob,
    deleteJob,
    updateJob,
    getAllJobs,
    getClientPostedJobs,
    getFulljobDetailsToClient,
    acceptJobRequest,
    rejectJobRequest,
    getAllJobsByCategory,
    getFulljobDetailsToFreelancer,
    createJobRequest,
    getRequestedJobs,
    getJobDetails,
    cancelJob,
    completeJob
} from "../controllers/job.controller.js"

const router = Router()

// Public route
router.route("/getallcategories").get(getAllJobCategories)

// Admin/Client/Freelancer: Get all jobs (with filters/pagination)
router.route("/getalljobs").get(verifyJwt, authorizeRoles("admin", "client", "freelancer"), getAllJobs)

// Client-only routes
router.route("/postjob").post(verifyJwt, authorizeRoles("client"), creatNewJob)
router.route("/updatejob/:jobId").patch(verifyJwt, authorizeRoles("client"), updateJob)
router.route("/deletejob/:jobId").delete(verifyJwt, authorizeRoles("client"), deleteJob)
router.route("/getclientjobs").get(verifyJwt, authorizeRoles("client"), getClientPostedJobs)
router.route("/getallrequests/:jobId").get(verifyJwt, authorizeRoles("client"), getFulljobDetailsToClient)
router.route("/acceptjobrequest/:requestId").patch(verifyJwt, authorizeRoles("client"), acceptJobRequest)
router.route("/rejectjobrequest/:requestId").patch(verifyJwt, authorizeRoles("client"), rejectJobRequest)

// Freelancer-only routes
router.route("/getjobsbycategory/:categoryId").get(verifyJwt, authorizeRoles("freelancer"), getAllJobsByCategory)
router.route("/getRequestedJobs").get(verifyJwt, authorizeRoles("freelancer"), getRequestedJobs)
router.route("/getfulldetails/:jobId").get(verifyJwt, authorizeRoles("freelancer"), getFulljobDetailsToFreelancer)
router.route("/createjobrequest").post(verifyJwt, authorizeRoles("freelancer"), createJobRequest)
router.route("/getrequestedjobs").get(verifyJwt, authorizeRoles("freelancer"), getRequestedJobs)

// Common routes (accessible by both client & freelancer)
router.route("/getjobdetails/:jobId").get(verifyJwt, authorizeRoles("client", "freelancer", "admin"), getJobDetails)
router.route("/canceljob/:jobId").patch(verifyJwt, authorizeRoles("client", "freelancer"), cancelJob)
router.route("/jobcompleted/:jobId").patch(verifyJwt, authorizeRoles("client", "freelancer"), completeJob)

export default router
