import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


export async function POST(req: NextRequest) {
  const usersCount = await prisma.user.count();
  if (usersCount > 0) {
    const role = req.cookies.get("role")?.value;
    console.log(role)
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  const body = await req.json();
  try {
    const user = await prisma.user.create({ data: body });
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}