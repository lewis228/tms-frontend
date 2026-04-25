import { useSession } from "@/store/session";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestOnlyLayout() {
  const session = useSession();
  if (session) return <Navigate to={"/app"} replace={true} />;
  return <Outlet />;
}
