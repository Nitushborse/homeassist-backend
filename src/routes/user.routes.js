// import { Router } from "express";
// import { registerUser, loginUser, logOutUser, completeUserProfile, getCurrentUser, getUserById, refreshAccessToken } from "../controllers/user.controller.js"
// import verifyJwt from "../middlewares/auth.middleware.js"
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router()

// router.route("/register").post(registerUser)
// router.route("/login").post(loginUser)
// router.route("/refreshaccesstoken").post(refreshAccessToken)


// //secured routes
// router.route("/logout").post(verifyJwt, logOutUser)
// router.route("/profile").patch(verifyJwt, upload.fields([
//     {
//         name: "avatar",
//         maxCount: 1
//     }]), completeUserProfile);


// router.route("/currentuser").get(verifyJwt, getCurrentUser)
// router.route("/getuserbyid/:id").get(getUserById);


// export default router


import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logOutUser, 
    completeUserProfile, 
    checkUserProfileCompletion,
    getCurrentUser, 
    getUserById, 
    refreshAccessToken 
} from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorizedRoles.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refreshaccesstoken").post(refreshAccessToken);

// Secured routes
router.route("/logout").post(verifyJwt, logOutUser);

router.route("/profile").patch(
    verifyJwt, 
    authorizeRoles("client", "freelancer", "admin"), // all authenticated users
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    completeUserProfile
);

router.route("/checkProfile").get(verifyJwt, checkUserProfileCompletion);

router.route("/currentuser").get(
    verifyJwt,
    authorizeRoles("client", "freelancer", "admin"),
    getCurrentUser
);

// Get user by ID (admin can view anyone, client/freelancer only themselves if needed)
router.route("/getuserbyid/:id").get(
    verifyJwt,
    authorizeRoles("admin", "client", "freelancer"),
    getUserById
);

export default router;
