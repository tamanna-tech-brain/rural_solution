import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Equipment from "../models/Equipment.js";
import MandiPool from "../models/MandiPool.js";
import Payment from "../models/Payment.js";
import Dispute from "../models/Dispute.js";

// GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEquipment,
      totalBookings,
      totalMandiPools,
      totalPayments,
      openDisputes,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Equipment.countDocuments(),
      Booking.countDocuments(),
      MandiPool.countDocuments(),
      Payment.countDocuments(),
      Dispute.countDocuments({ status: "open" }),
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select("name email village role createdAt profileImage"),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate("equipmentId", "name type")
        .populate("renterId", "name village"),
    ]);

    // Revenue calculation
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Booking status breakdown
    const bookingStatusAgg = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bookingStats = {};
    bookingStatusAgg.forEach((s) => { bookingStats[s._id] = s.count; });

    // Monthly bookings for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEquipment,
          totalBookings,
          totalMandiPools,
          totalPayments,
          openDisputes,
          totalRevenue,
        },
        bookingStats,
        monthlyBookings,
        recentUsers,
        recentBookings,
      },
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL USERS (admin)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { village: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -emailVerificationCode -emailVerificationCodeExpires")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PROMOTE / DEMOTE USER ROLE
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["farmer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be 'farmer' or 'admin'." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.json({ success: true, data: user, message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DEACTIVATE USER
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.json({ success: true, message: "User deactivated.", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
