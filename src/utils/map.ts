import { BHK, Timeline } from "@/generated/prisma";

function mapBHK(input?: string | null): BHK | null {
  if (!input) return null;
  const bhkMap: Record<string, BHK> = {
    "0": BHK.STUDIO,
    "STUDIO": BHK.STUDIO,
    "1": BHK.ONE,
    "ONE": BHK.ONE,
    "2": BHK.TWO,
    "TWO": BHK.TWO,
    "3": BHK.THREE,
    "THREE": BHK.THREE,
    "4": BHK.FOUR,
    "FOUR": BHK.FOUR,
  };
  return bhkMap[input.toUpperCase()] || null;
}

function mapTimeline(input?: string | null): Timeline {
  if (!input) return Timeline.EXPLORING; 
  const map: Record<string, Timeline> = {
    "0-3m": Timeline.ZERO_TO_THREE_M,
    "3-6m": Timeline.THREE_TO_SIX_M,
    "6+m": Timeline.MORE_THAN_SIX_M,
    "exploring": Timeline.EXPLORING,
    "ZERO_TO_THREE_M": Timeline.ZERO_TO_THREE_M,
    "THREE_TO_SIX_M": Timeline.THREE_TO_SIX_M,
    "MORE_THAN_SIX_M": Timeline.MORE_THAN_SIX_M,
    "EXPLORING": Timeline.EXPLORING,
  };
  return map[input.toLowerCase()] || Timeline.EXPLORING;
}

export { mapBHK, mapTimeline };