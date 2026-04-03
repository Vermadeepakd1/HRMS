import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, walletAddress } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const adminCount = await User.countDocuments({ role: "admin" });
    const normalizedRole =
      role === "admin" && adminCount === 0 ? "admin" : "employee";

    if (normalizedRole === "employee") {
      if (!walletAddress) {
        return res
          .status(400)
          .json({ msg: "walletAddress is required for employees" });
      }

      const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
      if (!isValidEthAddress) {
        return res.status(400).json({ msg: "Invalid wallet address" });
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: normalizedRole,
      walletAddress: walletAddress || undefined,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("register error:", error);

    if (error?.code === 11000) {
      return res.status(400).json({ msg: "User already exists" });
    }

    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
