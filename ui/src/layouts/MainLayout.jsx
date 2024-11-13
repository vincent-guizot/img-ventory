import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="w-full flex h-svh max-h-svh">
      <div className="h-full flex-[0.175] bg-blue-100 ">
        <Navbar></Navbar>
      </div>

      <div className="h-full flex-1">
        <Outlet></Outlet>
      </div>
    </div>
  );
}

export default MainLayout;
