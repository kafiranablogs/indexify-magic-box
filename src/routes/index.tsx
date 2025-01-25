import { Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SingleUrl from "@/pages/SingleUrl";
import BulkUpload from "@/pages/BulkUpload";
import GoogleConfig from "@/pages/GoogleConfig";
import Teams from "@/pages/Teams";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import Landing from "@/pages/Landing";

export const getRoutes = (session: any) => [
  {
    path: "/",
    element: session ? <Dashboard /> : <Landing />,
  },
  {
    path: "/single-url",
    element: session ? <SingleUrl /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/bulk-upload",
    element: session ? <BulkUpload /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/google-config",
    element: session ? <GoogleConfig /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/teams",
    element: session ? <Teams /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/profile",
    element: session ? <Profile /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: !session ? <Auth /> : <Navigate to="/" replace />,
  },
];