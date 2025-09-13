import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapBHK, mapTimeline } from "@/utils/map";
import { leadFormSchema } from "@/utils/leadFormSchema";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const error = leadFormSchema.safeParse(body).success ? null : "Invalid input data";
  if (error) return NextResponse.json({ error }, { status: 400 });

  // TODO: Replace with real user context
  const ownerId = 1;

  try {
    const buyer = await prisma.buyer.create({
      data: body
    });
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: ownerId,
        diff: { created: true, ...body },
      },
    });
    return NextResponse.json({ buyer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
