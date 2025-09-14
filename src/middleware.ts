import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  try {
    const [userId, role] = Buffer.from(token, "base64").toString().split(":");

    const response = NextResponse.next();
    response.cookies.set("user-id", userId, { path: "/" });
    response.cookies.set("role", role, { path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }
}

export const config = {
  matcher: ["/api/buyers/:path*"],
};
