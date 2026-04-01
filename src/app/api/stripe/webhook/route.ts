import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      await prisma.subscription.upsert({
        where: { stripe_customer_id: customerId },
        update: {
          stripe_subscription_id: sub.id,
          status: sub.status,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          current_period_end: new Date(sub.current_period_end * 1000),
        },
        create: {
          user_id: (sub.metadata?.user_id || (await getCustomerUserId(customerId)))!,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          current_period_end: new Date(sub.current_period_end * 1000),
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
  }

  return NextResponse.json({ received: true });
}

async function getCustomerUserId(customerId: string): Promise<string> {
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  return customer.metadata.user_id;
}
