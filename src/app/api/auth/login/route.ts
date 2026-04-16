import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { setSessionCookies } from "@/shared/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  setSessionCookies(response, data.session.access_token, data.session.refresh_token);
  return response;
}
