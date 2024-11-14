import React from "react";
import { Outlet } from "react-router-dom";

function ClassLayout() {
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="sticky w-full top-0">
          <div className="bg-sky-50 p-5">
            <h1 className="text-sky-700 font-bold text-xl"> Classes List</h1>
          </div>
        </div>
        <Outlet></Outlet>
      </div>
    </>
  );
}

export default ClassLayout;
