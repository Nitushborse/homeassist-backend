import { Router } from "express";
import { registerUser, loginUser, logOutUser, completeUserProfile, getCurrentUser, getUserById } from "../controllers/user.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJwt, logOutUser)
router.route("/currentuser").get(verifyJwt, getCurrentUser)
router.route("/:id").get(getUserById);
router.route("/profile").patch(verifyJwt, upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }]), completeUserProfile)



export default router