import api from "@/lib/axios";
import type { AppUser } from "@/types";

// Fields editable from the Profile page. Mirrors the backend
// UserProfileUpdateRequest — all fields optional so the client can PATCH
// partial updates.
export type UpdateMePayload = {
  name?: string | null;
  phone?: string | null;
  event_notification_enabled?: boolean;
  language?: string | null;
  // File attachments — two-step flow: UI gets a temp key from /file/upload-urls,
  // then passes it here for the server to confirm. Kept optional; Profile UI
  // doesn't surface file upload yet.
  temp_keys?: string[];
  remove_file_ids?: number[];
};

export async function updateMe(payload: UpdateMePayload) {
  const { data } = await api.patch<AppUser>("/user/me", payload);
  return data;
}
