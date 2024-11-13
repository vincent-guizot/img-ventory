import { createBrowserRouter } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";

// Pages
import Dashboard from "../pages/Dashboard";

// Routers

import classRouters from "./classRouters";
import meetingRouters from "./meetingRouters";
import studentRouters from "./studentRouters";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      classRouters,
      meetingRouters,
      studentRouters,
    ],
  },
  {
    path: "/login",
    element: <h1>Login</h1>,
  },
]);

export default routes;
