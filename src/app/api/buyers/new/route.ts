import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapBHK, mapTimeline } from "@/utils/map";
import { leadFormSchema } from "@/utils/leadFormSchema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const error = leadFormSchema.safeParse(body).success ? null : "Invalid input data";
  if (error) return NextResponse.json({ error }, { status: 400 });

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  const [userId, role] =  Buffer.from(token, "base64").toString().split(":");
  console.log(body.bhk)
  console.log(body.timeline)
  try {
    const buyer = await prisma.buyer.create({
      data: {
        ...body,
        ownerId: Number(userId),
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
