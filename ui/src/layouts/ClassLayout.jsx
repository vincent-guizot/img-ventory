import React from "react";
import { Outlet } from "react-router-dom";

function ClassLayout() {
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="sticky w-full top-0">
          <div className="bg-sky-800 p-4">
            <h1 className="text-white font-bold text-2xl"> CLASSES</h1>
          </div>
        </div>
        <Outlet></Outlet>
      </div>
    </>
  );
}

export default ClassLayout;
