import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js"
import { 
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
} from "../controllers/job.controller.js";



const router = Router()

router.route("/getallcategories").get(getAllJobCategories)

// secure route
// jobs routes
router.route("/postjob").post(verifyJwt,creatNewJob)
router.route("/getalljobs").get(verifyJwt, getAllJobs)
router.route("/updatejob/:jobId").patch(verifyJwt, updateJob)
router.route("/deletejob/:jobId").delete(verifyJwt, deleteJob)


// client routes
router.route("/getclientjobs").get(verifyJwt,getClientPostedJobs)
router.route("/acceptjobrequest/:requestId").patch(verifyJwt,  acceptJobRequest)
router.route("/rejectjobrequest/:requestId").patch(verifyJwt, rejectJobRequest)

// freelancer routes
router.route("/getjobsbycategory/:categoryId").get(verifyJwt, getAllJobsByCategory)
router.route("/createjobrequest").post(verifyJwt,createJobRequest)
router.route("/getrequestedjobs").get(verifyJwt, getRequestedJobs)

// common routes
router.route("/getjobdetails/:jobId").get(verifyJwt, getJobDetails)// common
router.route("/canceljob/:jobId").patch(verifyJwt, cancelJob)
router.route("/jobcompleted/:jobId").patch(verifyJwt, completeJob)

export default router