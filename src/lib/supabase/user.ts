import { createClient } from "./server";
import { prisma } from "@/lib/prisma";

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Checks if the user can perform write operations.
 * Free pass: first 24 hours after account creation.
 * After that: requires active Stripe subscription (active or trialing).
 * Throws "Subscription required" if not.
 */
export async function requireActiveSubscription(userId: string) {
  // Check free day: user created less than 24h ago
  const user = await getUser();
  if (user?.created_at) {
    const createdAt = new Date(user.created_at);
    const oneDayLater = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    if (new Date() < oneDayLater) {
      return null; // Free day — no subscription needed
    }
  }

  const subscription = await prisma.subscription.findUnique({
    where: { user_id: userId },
  });

  if (!subscription) {
    throw new Error("Subscription required");
  }

  const validStatuses = ["active", "trialing"];
  if (!validStatuses.includes(subscription.status)) {
    throw new Error("Subscription required");
  }

  // Check trial expiry
  if (subscription.status === "trialing" && subscription.trial_end) {
    if (new Date(subscription.trial_end) < new Date()) {
      throw new Error("Subscription required");
    }
  }

  return subscription;
}
