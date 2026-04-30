import { postJSON } from "@/shared/lib/api";

export const petAPI = {
  create: (body: unknown) => postJSON("/api/pets", body),
};
