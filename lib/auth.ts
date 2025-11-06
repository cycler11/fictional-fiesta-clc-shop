// Authentication utilities for access code
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "caltech-longevity-secret-key-change-in-production")

export async function createSession(
  participantId: number,
  email: string,
  name: string,
  role: "participant" | "operator" = "participant",
) {
  const token = await new SignJWT({ participantId, email, name, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token.value, secret)
    return payload as { participantId: number; email: string; name: string; role: "participant" | "operator" }
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
