import { NextResponse } from "next/server";

const SESSION_MAX_AGE = 60 * 60 * 18; // 18시간

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  maxAge: SESSION_MAX_AGE,
  path: "/",
};

export function setSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set("sb-access-token", accessToken, COOKIE_OPTIONS);
  response.cookies.set("sb-refresh-token", refreshToken, COOKIE_OPTIONS);
  return response;
}
