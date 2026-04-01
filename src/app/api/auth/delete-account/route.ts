import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { apiHandler } from "@/lib/api";

export const DELETE = apiHandler(async () => {
  const user = await requireUser();

  // 1. Cancel Stripe subscription if exists
  try {
    const sub = await prisma.subscription.findUnique({
      where: { user_id: user.id },
    });
    if (sub?.stripe_subscription_id) {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    }
    if (sub) {
      await prisma.subscription.delete({ where: { user_id: user.id } });
    }
  } catch {
    // Continue even if Stripe fails — still delete user data
  }

  // 2. Delete all user data
  await prisma.registro.deleteMany({ where: { user_id: user.id } });
  await prisma.categoria.deleteMany({ where: { user_id: user.id } });

  // 3. Delete Supabase auth user (requires service role key)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }

  return NextResponse.json({ deleted: true });
});
