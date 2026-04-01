import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

export async function GET() {
  const user = await requireUser();

  // Check free day (first 24h after account creation)
  const createdAt = new Date(user.created_at);
  const freeDayEnd = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const inFreeDay = now < freeDayEnd;

  const sub = await prisma.subscription.findUnique({ where: { user_id: user.id } });

  if (!sub) {
    return NextResponse.json({
      active: inFreeDay,
      status: inFreeDay ? "free_day" : "none",
      free_day_end: freeDayEnd.toISOString(),
    });
  }

  const isTrialing = sub.status === "trialing" && sub.trial_end && sub.trial_end > now;
  const isActive = sub.status === "active" && sub.current_period_end && sub.current_period_end > now;

  return NextResponse.json({
    active: inFreeDay || isTrialing || isActive,
    status: sub.status,
    trial_end: sub.trial_end?.toISOString() || null,
    current_period_end: sub.current_period_end?.toISOString() || null,
    free_day_end: freeDayEnd.toISOString(),
  });
}
