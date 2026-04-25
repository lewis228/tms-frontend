// NOTE: Mock data wrapped in async functions. Replace bodies with real axios calls once backend is connected.

export type StatCard = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: "blue" | "purple";
};

export type TotalUsersData = {
  month: string;
  thisYear: number;
  lastYear: number;
};

export type TrafficWebsite = {
  name: string;
  value: number;
};

export type TrafficDevice = {
  device: string;
  values: number[];
};

export type TrafficLocation = {
  country: string;
  percentage: number;
  fill: string;
};

export type NotificationItem = {
  id: string;
  icon: "bug" | "user" | "subscribe";
  title: string;
  time: string;
};

export type ActivityItem = {
  id: string;
  avatar: string;
  title: string;
  time: string;
};

export type ContactItem = {
  id: string;
  avatar: string;
  name: string;
};

export type DashboardData = {
  statCards: StatCard[];
  totalUsersData: TotalUsersData[];
  trafficWebsites: TrafficWebsite[];
  trafficDevices: TrafficDevice[];
  trafficLocations: TrafficLocation[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
  contacts: ContactItem[];
};

const MOCK: DashboardData = {
  statCards: [
    { label: "Views", value: "7,265", change: "+11.01%", trend: "up", color: "blue" },
    { label: "Visits", value: "3,671", change: "-0.03%", trend: "down", color: "purple" },
    { label: "New Users", value: "256", change: "+15.03%", trend: "up", color: "blue" },
    { label: "Active Users", value: "2,318", change: "+6.08%", trend: "up", color: "purple" },
  ],
  totalUsersData: [
    { month: "Jan", thisYear: 8000, lastYear: 5000 },
    { month: "Feb", thisYear: 12000, lastYear: 8000 },
    { month: "Mar", thisYear: 18000, lastYear: 11000 },
    { month: "Apr", thisYear: 22000, lastYear: 15000 },
    { month: "May", thisYear: 28000, lastYear: 18000 },
    { month: "Jun", thisYear: 24000, lastYear: 20000 },
    { month: "Jul", thisYear: 20000, lastYear: 16000 },
  ],
  trafficWebsites: [
    { name: "Google", value: 80 },
    { name: "YouTube", value: 65 },
    { name: "Instagram", value: 50 },
    { name: "Pinterest", value: 30 },
    { name: "Facebook", value: 25 },
    { name: "Twitter", value: 15 },
  ],
  trafficDevices: [
    { device: "Linux", values: [8000, 12000, 15000] },
    { device: "Mac", values: [12000, 18000, 22000] },
    { device: "iOS", values: [20000, 28000, 32000] },
    { device: "Windows", values: [15000, 22000, 25000] },
    { device: "Android", values: [10000, 15000, 20000] },
    { device: "Other", values: [5000, 8000, 10000] },
  ],
  trafficLocations: [
    { country: "United States", percentage: 52.1, fill: "#1c1c1e" },
    { country: "Canada", percentage: 22.8, fill: "#a78bfa" },
    { country: "Mexico", percentage: 13.9, fill: "#93c5fd" },
    { country: "Other", percentage: 11.2, fill: "#e5e7eb" },
  ],
  notifications: [
    { id: "1", icon: "bug", title: "You fixed a bug.", time: "Just now" },
    { id: "2", icon: "user", title: "New user registeRed.", time: "59 minutes ago" },
    { id: "3", icon: "bug", title: "You fixed a bug.", time: "12 hours ago" },
    { id: "4", icon: "subscribe", title: "Andi Lane subscribed to you.", time: "Today, 11:59 AM" },
  ],
  activities: [
    { id: "1", avatar: "https://i.pravatar.cc/32?u=abstract03", title: "Changed the style.", time: "Just now" },
    { id: "2", avatar: "https://i.pravatar.cc/32?u=female03", title: "Released a new version.", time: "59 minutes ago" },
    { id: "3", avatar: "https://i.pravatar.cc/32?u=male02", title: "Submitted a bug.", time: "12 hours ago" },
    { id: "4", avatar: "https://i.pravatar.cc/32?u=3d03", title: "Modified A data in Page X.", time: "Today, 11:59 AM" },
    { id: "5", avatar: "https://i.pravatar.cc/32?u=abstract04", title: "Deleted a page in Project X.", time: "Feb 2, 2026" },
  ],
  contacts: [
    { id: "1", avatar: "https://i.pravatar.cc/32?u=natali", name: "Natali Craig" },
    { id: "2", avatar: "https://i.pravatar.cc/32?u=drew", name: "Drew Cano" },
    { id: "3", avatar: "https://i.pravatar.cc/32?u=andi", name: "Andi Lane" },
    { id: "4", avatar: "https://i.pravatar.cc/32?u=koray", name: "Koray Okumus" },
    { id: "5", avatar: "https://i.pravatar.cc/32?u=kate", name: "Kate Morrison" },
    { id: "6", avatar: "https://i.pravatar.cc/32?u=melody", name: "Melody Macy" },
  ],
};

export async function fetchDashboardData(): Promise<DashboardData> {
  // Replace with: const { data } = await api.get<DashboardData>("/dashboard"); return data;
  return Promise.resolve(MOCK);
}
