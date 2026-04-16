"use client";

import { useState, useRef } from "react";
import { Check } from "lucide-react";

export default function ConsentFormPage() {
  const [form, setForm] = useState({
    healthIssues: "",
    allergies: "",
    aggressionLevel: "none",
    specialRequests: "",
    agreed: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const signature = canvasRef.current?.toDataURL() || "";

    const res = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        healthIssues: form.healthIssues,
        allergies: form.allergies,
        aggressionLevel: form.aggressionLevel,
        specialRequests: form.specialRequests,
        signature,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("동의서 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">동의서 제출 완료</h2>
        <p className="text-muted text-sm">감사합니다. 예약일에 뵙겠습니다!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">미용 동의서</h2>
      <p className="text-sm text-muted mb-6">
        안전한 미용을 위해 아래 내용을 작성해주세요
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 안내 사항 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-amber-800 mb-2">안내 사항</p>
          <ul className="text-amber-700 space-y-1 list-disc list-inside">
            <li>미용 중 발생할 수 있는 경미한 상처에 대해 양해 부탁드립니다</li>
            <li>건강 상태에 따라 미용이 제한될 수 있습니다</li>
            <li>
              미용 후 피부 반응이 나타날 수 있으며, 이는 개체 차이에 의한 것입니다
            </li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            건강 상태 / 질환
          </label>
          <textarea
            aria-label="건강상태" value={form.healthIssues}
            onChange={(e) =>
              setForm({ ...form, healthIssues: e.target.value })
            }
            rows={2}
            placeholder="현재 앓고 있는 질환이 있다면 작성해주세요"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">알러지</label>
          <input
            type="text"
            aria-label="알러지" value={form.allergies}
            onChange={(e) =>
              setForm({ ...form, allergies: e.target.value })
            }
            placeholder="알러지가 있다면 작성해주세요"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">공격성</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "none", label: "없음" },
              { value: "mild", label: "약간" },
              { value: "moderate", label: "보통" },
              { value: "severe", label: "심함" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({ ...form, aggressionLevel: opt.value })
                }
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.aggressionLevel === opt.value
                    ? "bg-primary text-white"
                    : "bg-white border border-border hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            요청 사항
          </label>
          <textarea
            aria-label="요청사항" value={form.specialRequests}
            onChange={(e) =>
              setForm({ ...form, specialRequests: e.target.value })
            }
            rows={2}
            placeholder="미용 관련 요청사항이 있다면 작성해주세요"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* 서명 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">보호자 서명</label>
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-muted hover:text-foreground"
            >
              다시 쓰기
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full border border-border rounded-xl bg-white cursor-crosshair touch-none"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            aria-label="동의" checked={form.agreed}
            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
            className="mt-0.5 rounded"
            required
          />
          <span>
            위 안내 사항을 확인하였으며, 미용 진행에 동의합니다.
          </span>
        </label>

        <button
          type="submit"
          disabled={!form.agreed}
          className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          동의서 제출
        </button>
      </form>
    </div>
  );
}
