import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
  const hasSessionCookie = Boolean(cookies[COOKIE_NAME]);
  const hasScheduledSession = opts.req.path.startsWith("/api/scheduled/") && Boolean(cookies.app_session_id);
  const hasBearerToken = opts.req.headers.authorization?.startsWith("Bearer ") ?? false;

  if (hasSessionCookie || hasScheduledSession || hasBearerToken) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
