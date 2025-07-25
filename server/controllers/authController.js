import User from "../models/User.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const { sign } = jwt;

export async function register(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    email,
    password,
    role,
    employeeId,
    profileImage,
    position,
    age,
    phone,
    address,
    city,
    zipCode,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      profileImage,
      position,
      age,
      phone,
      address,
      city,
      zipCode,
    });

    await user.save();

    const token = sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // remove password before sending
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // remove password before sending
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}
