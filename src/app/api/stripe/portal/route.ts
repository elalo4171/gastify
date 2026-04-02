import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

export async function POST() {
  try {
    const user = await requireUser();

    const sub = await prisma.subscription.findUnique({ where: { user_id: user.id } });
    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "No tienes una suscripción activa de Stripe" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${baseUrl}/suscripcion`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { error: "No se pudo abrir el portal de Stripe. Verifica que tu suscripción esté configurada correctamente." },
      { status: 500 }
    );
  }
}
