import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export const registerUser = async (email: string, password: string, name: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      workspace: {
        create: { name: `${name}'s Workspace` }
      }
    }
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } };
};

export const refreshAccessToken = async (token: string) => {
  const payload = verifyRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) throw new Error('Invalid refresh token');

  const newAccessToken = generateAccessToken(payload.userId);
  const newRefreshToken = generateRefreshToken(payload.userId);

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { token } });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};