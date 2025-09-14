import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapBHK, mapTimeline } from "@/utils/map";
import { leadFormSchema } from "@/utils/leadFormSchema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const error = leadFormSchema.safeParse(body).success ? null : "Invalid input data";
  if (error) return NextResponse.json({ error }, { status: 400 });

  const userId = req.cookies.get("user-id")?.value;
  const role = req.cookies.get("role")?.value;
  try {
    const buyer = await prisma.buyer.create({
      data: {
        ...body,
        creatorId: Number(userId),
        bhk: mapBHK(body.bhk),
        timeline: mapTimeline(body.timeline),
      },
    });
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: Number(userId),
        diff: { created: true, ...body },
      },
    });
    return NextResponse.json({ buyer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
