import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const periodEnd = sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000)
        : null;

      const existingSub = await prisma.subscription.findFirst({ where: { stripe_customer_id: customerId } });
      const userId = sub.metadata?.user_id || existingSub?.user_id;

      if (!userId) {
        // Can't determine user, skip but acknowledge
        return NextResponse.json({ received: true, skipped: true });
      }

      await prisma.subscription.upsert({
        where: { stripe_customer_id: customerId },
        update: {
          stripe_subscription_id: sub.id,
          status: sub.status,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          current_period_end: periodEnd,
        },
        create: {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          current_period_end: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      await prisma.subscription.updateMany({
        where: { stripe_customer_id: customerId },
        data: { status: "canceled" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

      if (customerId) {
        await prisma.subscription.updateMany({
          where: { stripe_customer_id: customerId },
          data: { status: "past_due" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
