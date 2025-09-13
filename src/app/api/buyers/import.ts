import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  const { buyers } = await req.json();
  if (!Array.isArray(buyers) || buyers.length === 0) {
    return NextResponse.json({ error: "No valid buyers to import" }, { status: 400 });
  }
  try {
    await prisma.$transaction(buyers.map((buyer: any) => prisma.buyer.create({ data: buyer })));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
