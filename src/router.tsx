import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Envelope from "./pages/Envelope";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: { name: "Dashboard Overview" }
      },
      {
        path: "/envelope",
        element: <Envelope />,
        handle: { name: "Envelope" }
      }
    ],
  },
])