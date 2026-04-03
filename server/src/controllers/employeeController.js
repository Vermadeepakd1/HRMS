import User from "../models/User.js";

export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find(
      { role: "employee" },
      { password: 0 },
    ).sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const { name, role, walletAddress } = req.body;

    if (name !== undefined) employee.name = name;
    if (role !== undefined)
      employee.role = role === "admin" ? "employee" : role;
    if (walletAddress !== undefined) employee.walletAddress = walletAddress;

    await employee.save();

    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      walletAddress: employee.walletAddress,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    await employee.deleteOne();

    res.json({ msg: "Employee deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
