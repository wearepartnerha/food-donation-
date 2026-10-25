import { api, clearSessionToken } from "@/api/client";
import type { AuthUser, NgoRegistration, NotificationRow, Profile } from "@/api/types";

export type Account = { user: AuthUser; profile: Profile; isAdmin: boolean };

/** The signed-in account, or null when signed out (or the session's profile no longer exists). */
export const getAccount = () => api<Account | null>("GET", "/api/account");

export async function signOut() {
  clearSessionToken();
  await api("POST", "/api/auth/signout").catch(() => undefined);
}

export const updateProfile = ({
  data,
}: {
  data: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
}) => api("PATCH", "/api/account/profile", data);

export const listNotifications = () => api<NotificationRow[]>("GET", "/api/notifications");

export const markNotificationsRead = () => api("POST", "/api/notifications/read");

export const getMyRegistration = () => api<NgoRegistration | null>("GET", "/api/registration");

/**
 * Creates or updates the caller's distribution-partner registration. The API geocodes the PIN
 * code, so "Verified" status can't be claimed by the client.
 */
export const saveMyRegistration = ({
  data,
}: {
  data: {
    organization_name: string;
    registration_80g: string;
    contact_person: string;
    contact_phone: string;
    contact_email: string;
    pincode: string;
  };
}) => api("PUT", "/api/registration", data);
