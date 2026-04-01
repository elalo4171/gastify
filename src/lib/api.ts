import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Wraps an API route handler with:
 * - Error catching with proper HTTP status codes
 * - Structured request/error logging (visible in Vercel Function Logs)
 */
export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    const start = Date.now();
    const { method } = req;
    const path = req.nextUrl.pathname;

    try {
      const response = await handler(req);

      console.log(JSON.stringify({
        level: "info",
        method,
        path,
        status: response.status,
        duration: Date.now() - start,
      }));

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      const { status, code } = mapError(message);

      console.error(JSON.stringify({
        level: "error",
        method,
        path,
        status,
        code,
        message,
        duration: Date.now() - start,
      }));

      return NextResponse.json({ error: code }, { status });
    }
  };
}

function mapError(message: string): { status: number; code: string } {
  switch (message) {
    case "Unauthorized":
      return { status: 401, code: "unauthorized" };
    case "Subscription required":
      return { status: 403, code: "subscription_required" };
    default:
      return { status: 500, code: "internal_error" };
  }
}
