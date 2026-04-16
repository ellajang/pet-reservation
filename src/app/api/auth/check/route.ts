import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { setSessionCookies } from "@/shared/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token");
  const refreshToken = cookieStore.get("sb-refresh-token");

  if (!accessToken?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  // 토큰 만료 시 refresh token으로 갱신
  if (error && refreshToken?.value) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken.value,
    });

    if (refreshError || !refreshData.session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const response = NextResponse.json({
      authenticated: true,
      user: { email: refreshData.session.user.email },
    });
    setSessionCookies(response, refreshData.session.access_token, refreshData.session.refresh_token);
    return response;
  }

  if (error || !user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: { email: user.email } });
}
