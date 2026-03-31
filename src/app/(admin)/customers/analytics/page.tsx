"use client";

import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  CalendarClock,
  AlertTriangle,
  UserPlus,
  Ban,
  TrendingUp,
  Crown,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  summary: {
    totalCustomers: number;
    thisMonthNew: number;
    revisitRate: number;
    avgVisitCycle: number;
    noshowRate: number;
    blockedCount: number;
  };
  breedDistribution: {
    breed: string;
    count: number;
    percentage: number;
  }[];
  serviceAnalysis: {
    name: string;
    count: number;
    revenue: number;
  }[];
  monthlyNew: {
    month: string;
    count: number;
  }[];
  topCustomers: {
    name: string;
    visits: number;
    revenue: number;
  }[];
}

const COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-teal-500",
];

export default function CustomerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers/analytics")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">고객 분석</h2>
        <p className="text-muted text-center py-16">불러오는 중...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, breedDistribution, serviceAnalysis, monthlyNew, topCustomers } = data;

  const maxMonthlyNew = Math.max(...monthlyNew.map((m) => m.count), 1);
  const maxServiceCount = Math.max(...serviceAnalysis.map((s) => s.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">고객 분석</h2>
          <p className="text-sm text-muted mt-1">
            고객 세그먼트 및 행동 패턴 분석
          </p>
        </div>
        <Link
          href="/customers"
          className="text-sm text-primary hover:text-primary-hover font-medium"
        >
          ← 고객 목록
        </Link>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <p className="text-xs text-muted">총 고객 수</p>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {summary.totalCustomers}명
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-muted">이번 달 신규</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {summary.thisMonthNew}명
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-muted">재방문율</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {summary.revisitRate}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-muted">평균 방문 주기</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {summary.avgVisitCycle > 0 ? `${summary.avgVisitCycle}일` : "-"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-muted">노쇼율</p>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {summary.noshowRate}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-muted">차단 고객</p>
          </div>
          <p className="text-2xl font-bold text-gray-600">
            {summary.blockedCount}명
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 견종별 분포 */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">견종별 분포</h3>
          </div>
          <div className="p-5">
            {breedDistribution.length === 0 ? (
              <p className="text-muted text-center py-8 text-sm">
                데이터가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {breedDistribution.map((item, i) => (
                  <div key={item.breed}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${COLORS[i % COLORS.length]}`}
                        />
                        <span className="font-medium">{item.breed}</span>
                      </div>
                      <span className="text-muted">
                        {item.count}마리 ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${COLORS[i % COLORS.length]}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 서비스별 이용 분석 */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">서비스별 이용 분석</h3>
          </div>
          <div className="p-5">
            {serviceAnalysis.length === 0 ? (
              <p className="text-muted text-center py-8 text-sm">
                데이터가 없습니다
              </p>
            ) : (
              <>
                <div className="flex items-end gap-3 h-40 mb-4">
                  {serviceAnalysis.map((s) => {
                    const height = (s.count / maxServiceCount) * 100;
                    return (
                      <div
                        key={s.name}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-xs text-muted">{s.count}건</span>
                        <div
                          className="w-full bg-primary rounded-t-lg"
                          style={{ height: `${Math.max(height, 8)}%` }}
                        />
                        <span className="text-[10px] text-muted text-center truncate w-full">
                          {s.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2 border-t border-border pt-3">
                  {serviceAnalysis.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{s.name}</span>
                      <span className="text-muted">
                        평균 ₩
                        {s.count > 0
                          ? Math.round(s.revenue / s.count).toLocaleString()
                          : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 신규 고객 추이 */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted" />
              <h3 className="font-semibold">월별 신규 고객 추이</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-3 h-40">
              {monthlyNew.map((m) => {
                const height = (m.count / maxMonthlyNew) * 100;
                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs text-muted">
                      {m.count > 0 ? m.count : "-"}
                    </span>
                    <div
                      className="w-full bg-emerald-400 rounded-t-lg"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs font-medium">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 단골 고객 TOP 5 */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold">단골 고객 TOP 5</h3>
            </div>
          </div>
          <div className="p-5">
            {topCustomers.length === 0 ? (
              <p className="text-muted text-center py-8 text-sm">
                데이터가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        i === 0
                          ? "bg-amber-500"
                          : i === 1
                          ? "bg-gray-400"
                          : i === 2
                          ? "bg-amber-700"
                          : "bg-gray-300"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted">
                        방문 {c.visits}회
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      ₩{c.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
