import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // pgcrypto의 crypt 함수로 비밀번호 검증
  const { data, error } = await supabase.rpc("verify_admin_password", {
    input_username: username,
    input_password: password,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    );
  }

  // 세션 토큰 생성 (간단한 랜덤 문자열)
  const token = crypto.randomUUID() + "-" + crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });

  return NextResponse.json({ success: true });
}
