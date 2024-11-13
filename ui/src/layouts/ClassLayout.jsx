import React from "react";
import { Outlet } from "react-router-dom";

function ClassLayout() {
  return (
    <div className="container mx-auto px-2 sm:px-6 lg:px-8">
      <Outlet></Outlet>
    </div>
  );
}

export default ClassLayout;
