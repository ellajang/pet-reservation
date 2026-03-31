"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setPermissionGranted(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          setPermissionGranted(perm === "granted");
        });
      }
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      // 첫 번째 음 (높은 톤)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(830, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // 두 번째 음 (더 높은 톤)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1050, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.5);
    } catch {
      // AudioContext 지원 안 되면 무시
    }
  }, []);

  const showBrowserNotification = useCallback(
    (title: string, body: string) => {
      playNotificationSound();
      if (permissionGranted && "Notification" in window) {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      }
    },
    [permissionGranted, playNotificationSound]
  );

  // Supabase Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reservations",
        },
        async (payload) => {
          const reservation = payload.new;

          // 고객 정보 가져오기
          const { data: customer } = await supabase
            .from("customers")
            .select("name")
            .eq("id", reservation.customer_id)
            .single();

          const { data: service } = await supabase
            .from("services")
            .select("name")
            .eq("id", reservation.service_id)
            .single();

          const customerName = customer?.name || "고객";
          const serviceName = service?.name || "서비스";
          const message = `${customerName}님이 ${reservation.date} ${reservation.start_time?.slice(0, 5)} ${serviceName} 예약을 요청했습니다`;

          const newNotification: Notification = {
            id: reservation.id,
            message,
            time: new Date().toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: false,
          };

          setNotifications((prev) => [newNotification, ...prev].slice(0, 20));

          // 브라우저 알림
          showBrowserNotification("새로운 예약이 있습니다!", message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showBrowserNotification]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-border shadow-lg z-50">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h4 className="font-semibold text-sm">알림</h4>
              {notifications.length > 0 && (
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:text-primary-hover font-medium"
                    >
                      모두 읽음
                    </button>
                  )}
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-muted hover:text-foreground"
                  >
                    모두 지우기
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-muted text-center py-8 text-sm">
                  새로운 알림이 없습니다
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-border last:border-none ${
                      n.read ? "" : "bg-indigo-50/50"
                    }`}
                  >
                    <div className="flex gap-2">
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-muted mt-1">{n.time}</p>
                        {!n.read && (
                          <button
                            onClick={() => {
                              markAsRead(n.id);
                              setShowPanel(false);
                              router.push("/dashboard");
                            }}
                            className="text-xs text-primary font-medium mt-1 hover:text-primary-hover"
                          >
                            확인
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="p-1 hover:bg-gray-100 rounded self-start"
                      >
                        <X className="w-3 h-3 text-muted" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
