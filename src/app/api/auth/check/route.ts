import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

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

  // 토큰 유효성 검증
  const { data: { user }, error } = await supabase.auth.getUser();

  // 토큰 만료 시 refresh token으로 갱신
  if (error && refreshToken?.value) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken.value,
    });

    if (refreshError || !refreshData.session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // 새 토큰을 쿠키에 저장
    const response = NextResponse.json({
      authenticated: true,
      user: { email: refreshData.session.user.email },
    });
    response.cookies.set("sb-access-token", refreshData.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("sb-refresh-token", refreshData.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  if (error || !user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: { email: user.email } });
}
