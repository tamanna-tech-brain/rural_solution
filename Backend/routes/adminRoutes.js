import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  getPublicOverview,
} from "../controllers/adminController.js";

const router = express.Router();

// Public platform overview stats (open to all farmers/visitors)
router.get("/overview", getPublicOverview);

// All admin routes below require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/deactivate", deactivateUser);

export default router;
