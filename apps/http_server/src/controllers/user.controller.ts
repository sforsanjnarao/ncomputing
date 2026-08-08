import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { RegisterSchema, LoginSchema } from "../zod/user.zod";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

const AUTH_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

export const registerController = async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Please check the highlighted fields.",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ error: "An account with that email already exists." });
    }

    const hashPassword = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        password: hashPassword,
        phone: parsed.data.phone?.trim() || null,
        organization: parsed.data.organization?.trim() || null,
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.cookie("token", token, AUTH_COOKIE_OPTIONS);

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        addresses: [],
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Please check the highlighted fields.",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const email = parsed.data.email;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { addresses: { orderBy: { createdAt: "desc" } } },
    });
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const passwordMatch = await bcrypt.compare(
      parsed.data.password,
      user.password,
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.cookie("token", token, AUTH_COOKIE_OPTIONS);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: { orderBy: { createdAt: "desc" } } },
    });
    if (!user)
      return res.status(401).json({ error: "Your account no longer exists." });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const logoutController = (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};
