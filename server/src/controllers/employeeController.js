import Employee from "../models/Employee.js";

export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      createdBy: req.user.id,
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const { name, role, department, skills, walletAddress } = req.body;

    if (name !== undefined) employee.name = name;
    if (role !== undefined) employee.role = role;
    if (department !== undefined) employee.department = department;
    if (skills !== undefined) employee.skills = skills;
    if (walletAddress !== undefined) employee.walletAddress = walletAddress;

    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
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
