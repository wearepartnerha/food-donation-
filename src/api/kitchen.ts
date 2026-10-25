import { api } from "@/api/client";
import type { DistributionCenter, KitchenInventoryItem, Sponsorship } from "@/api/types";
import type { InventoryCategory } from "@/lib/kitchen";

export type KitchenStats = {
  meals_cooked_today: number;
  children_served_today: number;
  active_kitchen_centers: number;
  meals_cooked_this_month: number;
  total_sponsorships_amount: number;
  total_meals_sponsored: number;
  low_stock_items: number;
};

/** Live community kitchen totals — public, non-PII headline numbers. */
export const getKitchenStats = () => api<KitchenStats>("GET", "/api/kitchen/stats");

// ---------------------------------------------------------------- Inventory (read public, write admin)

export const listInventory = () => api<KitchenInventoryItem[]>("GET", "/api/inventory");

export const addInventoryItem = ({
  data,
}: {
  data: {
    category: InventoryCategory;
    item_name: string;
    unit: string;
    current_stock: number;
    reorder_threshold: number;
  };
}) => api("POST", "/api/inventory", data);

export const updateInventoryStock = ({ data }: { data: { id: string; current_stock: number } }) =>
  api("PATCH", `/api/inventory/${encodeURIComponent(data.id)}`, {
    current_stock: data.current_stock,
  });

// ---------------------------------------------------------------- Distribution centers & meal logs

export const listDistributionCenters = () =>
  api<DistributionCenter[]>("GET", "/api/distribution-centers");

export const addDistributionCenter = ({
  data,
}: {
  data: {
    name: string;
    center_type: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    daily_meal_target: number;
  };
}) => api("POST", "/api/distribution-centers", data);

export const logMeals = ({
  data,
}: {
  data: { center_id: string; meals_cooked: number; children_served: number };
}) => api("POST", "/api/meal-logs", data);

// ---------------------------------------------------------------- Sponsorships (sponsor's own; admins see all)

export const listMySponsorships = () => api<Sponsorship[]>("GET", "/api/sponsorships/mine");

/** Records a pledge (no payment processing) against the signed-in sponsor's account. */
export const recordSponsorship = ({
  data,
}: {
  data: {
    sponsor_name: string;
    sponsor_email: string | null;
    amount_inr: number;
    meals_sponsored: number;
    message: string | null;
  };
}) => api("POST", "/api/sponsorships", data);

// ---------------------------------------------------------------- Contact & volunteer forms (open to visitors)

export const submitContactMessage = ({
  data,
}: {
  data: { name: string; email: string; message: string };
}) => api("POST", "/api/contact-messages", data);

export const submitVolunteerSignup = ({
  data,
}: {
  data: {
    name: string;
    email: string;
    phone: string | null;
    location_label: string | null;
    message: string | null;
  };
}) => api("POST", "/api/volunteer-signups", data);
