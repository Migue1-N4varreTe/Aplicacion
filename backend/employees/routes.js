import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requirePermission } from "../auth/middleware.js";
import { PERMISSIONS } from "../users/roles.js";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

// Get all employees with attendance data
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW),
  async (req, res) => {
    try {
      const { store_id, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("users")
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          store_id,
          is_active,
          created_at,
          attendance:attendance_records(
            id,
            clock_in,
            clock_out,
            date,
            hours_worked
          )
        `, { count: "exact" })
        .eq("is_active", true)
        .neq("role", "client")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (store_id) {
        query = query.eq("store_id", store_id);
      }

      const { data: employees, error, count } = await query;

      if (error) throw error;

      res.json({
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get employee by ID with detailed info
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: employee, error } = await supabase
        .from("users")
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          store_id,
          phone,
          address,
          is_active,
          created_at,
          attendance:attendance_records(
            id,
            clock_in,
            clock_out,
            date,
            hours_worked,
            notes
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Clock in
router.post(
  "/:id/clock-in",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW_ATTENDANCE),
  [
    body("notes").optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { notes } = req.body;
      const currentDate = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toISOString();

      // Check if already clocked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("user_id", id)
        .eq("date", currentDate)
        .is("clock_out", null)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingRecord) {
        return res.status(400).json({ 
          error: "Employee is already clocked in for today" 
        });
      }

      // Create new attendance record
      const { data: attendance, error } = await supabaseAdmin
        .from("attendance_records")
        .insert([
          {
            user_id: id,
            date: currentDate,
            clock_in: currentTime,
            notes: notes || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: "Clocked in successfully",
        attendance,
      });
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Clock out
router.post(
  "/:id/clock-out",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW_ATTENDANCE),
  [
    body("notes").optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { notes } = req.body;
      const currentDate = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toISOString();

      // Find today's clock-in record
      const { data: attendanceRecord, error: findError } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("user_id", id)
        .eq("date", currentDate)
        .is("clock_out", null)
        .single();

      if (findError) {
        return res.status(400).json({ 
          error: "No active clock-in record found for today" 
        });
      }

      // Calculate hours worked
      const clockInTime = new Date(attendanceRecord.clock_in);
      const clockOutTime = new Date(currentTime);
      const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert to hours

      // Update attendance record
      const { data: updatedAttendance, error } = await supabaseAdmin
        .from("attendance_records")
        .update({
          clock_out: currentTime,
          hours_worked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimal places
          notes: notes ? `${attendanceRecord.notes || ""}\nClock-out: ${notes}`.trim() : attendanceRecord.notes,
        })
        .eq("id", attendanceRecord.id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: "Clocked out successfully",
        attendance: updatedAttendance,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
      });
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get employee performance
router.get(
  "/:id/performance",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW_ATTENDANCE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = "30" } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get attendance records
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("user_id", id)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (attendanceError) throw attendanceError;

      // Get sales records
      const { data: salesRecords, error: salesError } = await supabase
        .from("sales")
        .select(`
          id,
          total,
          created_at,
          items:sale_items(
            quantity,
            unit_price
          )
        `)
        .eq("user_id", id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (salesError) throw salesError;

      // Calculate performance metrics
      const totalHoursWorked = attendanceRecords.reduce((sum, record) => sum + (record.hours_worked || 0), 0);
      const totalSales = salesRecords.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const totalTransactions = salesRecords.length;
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      const salesPerHour = totalHoursWorked > 0 ? totalSales / totalHoursWorked : 0;

      // Group attendance by week
      const weeklyAttendance = attendanceRecords.reduce((acc, record) => {
        const weekStart = new Date(record.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        
        if (!acc[weekKey]) {
          acc[weekKey] = {
            week: weekKey,
            totalHours: 0,
            daysWorked: 0,
          };
        }
        
        acc[weekKey].totalHours += record.hours_worked || 0;
        acc[weekKey].daysWorked += 1;
        return acc;
      }, {});

      res.json({
        period: `Last ${period} days`,
        summary: {
          totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
          totalSales,
          totalTransactions,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          salesPerHour: Math.round(salesPerHour * 100) / 100,
          daysWorked: attendanceRecords.length,
        },
        attendanceRecords,
        salesRecords,
        weeklyAttendance: Object.values(weeklyAttendance),
      });
    } catch (error) {
      console.error("Error fetching employee performance:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get attendance records for a specific date range
router.get(
  "/:id/attendance",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW_ATTENDANCE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { from_date, to_date, page = 1, limit = 30 } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("attendance_records")
        .select("*", { count: "exact" })
        .eq("user_id", id)
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (from_date) {
        query = query.gte("date", from_date);
      }
      if (to_date) {
        query = query.lte("date", to_date);
      }

      const { data: attendance, error, count } = await query;

      if (error) throw error;

      res.json({
        attendance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Update attendance record (admin only)
router.put(
  "/attendance/:recordId",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.MANAGE_ATTENDANCE),
  [
    body("clock_in").optional().isISO8601(),
    body("clock_out").optional().isISO8601(),
    body("notes").optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recordId } = req.params;
      const { clock_in, clock_out, notes } = req.body;

      const updateFields = {};
      if (clock_in !== undefined) updateFields.clock_in = clock_in;
      if (clock_out !== undefined) updateFields.clock_out = clock_out;
      if (notes !== undefined) updateFields.notes = notes;

      // Recalculate hours if both times are provided
      if (clock_in && clock_out) {
        const clockInTime = new Date(clock_in);
        const clockOutTime = new Date(clock_out);
        const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);
        updateFields.hours_worked = Math.round(hoursWorked * 100) / 100;
      }

      const { data: attendance, error } = await supabaseAdmin
        .from("attendance_records")
        .update(updateFields)
        .eq("id", recordId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: "Attendance record updated successfully",
        attendance,
      });
    } catch (error) {
      console.error("Error updating attendance record:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
