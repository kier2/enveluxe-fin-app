import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Transaction from "./pages/Transaction";
import Income from "./pages/Income";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
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
            path: "/budget",
            element: <Budget />,
            handle: { name: "Budget" }
          },
          {
            path: "/income",
            element: <Income />,
            handle: { name: "Income" }
          },
          {
            path: "/transactions",
            element: <Transaction />,
            handle: { name: "Transactions" }
          },
          {
            path: "/profile",
            element: <EditProfile />,
            handle: { name: "Edit Profile" }
          },
          {
            path: "/settings",
            element: <Settings />,
            handle: { name: "Settings" }
          },
          {
            path: "/reports",
            element: <Reports />,
            handle: { name: "Reports" }
          }
        ],
      }
    ]
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
            handle: { name: "Auth Dashboard" }
          },
          {
            path: "register",
            element: <Register />,
            handle: { name: "Register" }
          }
        ]
      }
    ]
  }
])