import { prisma } from "@/lib/prisma";
import { ConflictError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth";
import type { LoginInput, RegisterInput } from "@/lib/validation";
import type { User } from "@/types";

function mapUser(user: { id: string; email: string; name: string | null; createdAt: Date }): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
      settings: { create: {} },
    },
  });

  return mapUser(user);
}

const DUMMY_HASH = "$2a$12$dummy.hash.to.prevent.timing.attacks.on.email.enumeration";

export async function authenticateUser(input: LoginInput): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Always run bcrypt even when the user doesn't exist. Without this, an
  // attacker can enumerate valid email addresses by measuring response time:
  // a missing user returns in ~0ms while a wrong password takes ~100ms.
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const valid = await verifyPassword(input.password, hashToCompare);

  if (!user || !valid) return null;
  return mapUser(user);
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? mapUser(user) : null;
}
