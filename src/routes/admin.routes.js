import verifyJwt from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizedRoles.middleware.js";
import {
    getAdminDashboardStats,
    getAllClients,
    getAllFreelancers,
    getAllAdmins
} from "../controllers/admin.controller.js";

import { Router } from "express";

const router = Router();

router.route("/stats").get(
    verifyJwt,
    authorizeRoles("admin"),
    getAdminDashboardStats
);

router.route("/clients").get(
    verifyJwt,
    authorizeRoles("admin"),
    getAllClients
);

router.route("/freelancers").get(
    verifyJwt,
    authorizeRoles("admin"),
    getAllFreelancers
);

router.route("/admins").get(
    verifyJwt,
    authorizeRoles("admin"),
    getAllAdmins
);

export default router;

