import React from "react";
import { Outlet } from "react-router-dom";

import SideBar from "../components/SideBar";

function MainLayout() {
  return (
    <div className="w-full flex h-svh max-h-svh">
      <div className="h-full flex-[0.175] bg-sky-800 p-4 ">
        <SideBar></SideBar>
      </div>

      <div className="h-full flex-1">
        <Outlet></Outlet>
      </div>
    </div>
  );
}

export default MainLayout;
