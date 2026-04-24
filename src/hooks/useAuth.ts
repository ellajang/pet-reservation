import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/authAPI";

export function useAuthCheck() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    authAPI.check().then((res) => {
      if (res.ok) {
        setAuthenticated(true);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return authenticated;
}

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    await authAPI.logout();
    router.push("/login");
  };

  return logout;
}
