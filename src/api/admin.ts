import { api } from "@/api/client";
import type {
  ContactMessage,
  NgoRegistration,
  Profile,
  Sponsorship,
  VolunteerSignup,
} from "@/api/types";

export type AdminDashboard = {
  stats: {
    total_users: number;
    pending_contact_messages: number;
    pending_volunteer_signups: number;
  };
  profiles: Profile[];
  sponsorships: Sponsorship[];
  messages: ContactMessage[];
  signups: VolunteerSignup[];
  registrations: NgoRegistration[];
};

export const getAdminDashboard = () => api<AdminDashboard>("GET", "/api/admin/dashboard");

/** Approves a partner registration by creating its distribution center and linking the two. */
export const approveRegistration = ({ data }: { data: { id: string } }) =>
  api("POST", `/api/admin/registrations/${encodeURIComponent(data.id)}/approve`);
