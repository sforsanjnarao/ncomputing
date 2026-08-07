import bcrypt from "bcryptjs";
import { Role, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { badRequest, unauthorized } from "../utils/errors";

/** The shape of a user that is safe to send to a browser. */
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  role: Role;
};

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  organization: user.organization,
  role: user.role,
});

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organization?: string;
};

export async function register(input: RegisterInput): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw badRequest("An account with that email already exists.");

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: await bcrypt.hash(input.password, 10),
      phone: input.phone?.trim() || null,
      organization: input.organization?.trim() || null,
      // Role is deliberately not taken from the request body. The only way to
      // become an ADMIN is through the seed script or a direct DB change.
      role: Role.USER,
    },
  });

  return toPublicUser(user);
}

export async function login(email: string, password: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Same message and roughly the same work either way, so the response does not
  // reveal whether an email is registered.
  if (!user) {
    await bcrypt.hash(password, 10);
    throw unauthorized("Incorrect email or password.");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw unauthorized("Incorrect email or password.");

  return toPublicUser(user);
}

export async function getById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}
