"use client";

import { useState } from "react";
import { Save, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const [shopName, setShopName] = useState("펫살롱");
  const [businessHours, setBusinessHours] = useState({
    start: "09:00",
    end: "18:00",
  });
  const [closedDays, setClosedDays] = useState([0]); // 0 = 일요일
  const [copied, setCopied] = useState(false);

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/demo`
      : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">설정</h2>

      <div className="space-y-6">
        {/* 매장 정보 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">매장 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">매장명</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full max-w-md border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 영업 시간 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">영업 시간</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">시작</label>
              <input
                type="time"
                value={businessHours.start}
                onChange={(e) =>
                  setBusinessHours({ ...businessHours, start: e.target.value })
                }
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="mt-6">~</span>
            <div>
              <label className="block text-sm font-medium mb-1">종료</label>
              <input
                type="time"
                value={businessHours.end}
                onChange={(e) =>
                  setBusinessHours({ ...businessHours, end: e.target.value })
                }
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">휴무일</label>
            <div className="flex gap-2">
              {dayNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setClosedDays(
                      closedDays.includes(i)
                        ? closedDays.filter((d) => d !== i)
                        : [...closedDays, i]
                    )
                  }
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    closedDays.includes(i)
                      ? "bg-red-100 text-red-600 border-red-200 border"
                      : "bg-gray-50 text-foreground border border-border hover:bg-gray-100"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 예약 링크 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">고객 예약 링크</h3>
          <p className="text-sm text-muted mb-3">
            이 링크를 카카오톡으로 고객에게 보내면, 고객이 직접 예약할 수
            있습니다.
          </p>
          <div className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={bookingUrl}
              readOnly
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors">
          <Save className="w-4 h-4" />
          설정 저장
        </button>
      </div>
    </div>
  );
}
