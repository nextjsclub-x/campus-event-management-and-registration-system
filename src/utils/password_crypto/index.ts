// src/utils/password_crypto/index.ts

import * as bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt.
 *
 * @param password - The password to hash.
 * @param rounds - Optional number of salt rounds (default: 10).
 * @returns A promise that resolves to the hashed password string.
 */
export async function hashPassword(
  password: string,
  rounds: number = 10
): Promise<string> {
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(rounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Verifies a password against a stored hash.
 *
 * @param storedHash - The stored bcrypt hash to compare against.
 * @param passwordAttempt - The password attempt to verify.
 * @returns A promise that resolves to a boolean indicating whether the password is correct.
 */
export async function verifyPassword(
  storedHash: string,
  passwordAttempt: string
): Promise<boolean> {
  return bcrypt.compare(passwordAttempt, storedHash);
}
