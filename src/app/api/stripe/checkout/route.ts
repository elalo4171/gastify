import { NextResponse } from "next/server";
import { getStripe, PRICE_ID, TRIAL_DAYS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

export async function POST() {
  const user = await requireUser();

  // Check if user already has a Stripe customer
  let sub = await prisma.subscription.findUnique({ where: { user_id: user.id } });

  // Check for duplicate active/trialing subscription
  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    return NextResponse.json(
      { error: "Ya tienes una suscripción activa" },
      { status: 400 }
    );
  }

  try {
    let customerId: string;
    if (sub?.stripe_customer_id) {
      customerId = sub.stripe_customer_id;
    } else {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Create subscription record
      if (!sub) {
        sub = await prisma.subscription.create({
          data: {
            user_id: user.id,
            stripe_customer_id: customerId,
            status: "incomplete",
          },
        });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
      },
      success_url: `${baseUrl}/dashboard?subscribed=true`,
      cancel_url: `${baseUrl}/suscripcion`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Error al crear la sesión de pago" },
      { status: 500 }
    );
  }
}
