import React from "react";

import { Link } from "react-router-dom";

import {
  AcademicCapIcon,
  UserIcon,
  HomeIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";

function Navbar() {
  return (
    <>
     
      <div className="grid h-full place-content-center bg-sky-800">
        <div className="">
          <ComputerDesktopIcon className="text-white"></ComputerDesktopIcon>
        </div>
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            class="rounded-md hover:text-sky-800 hover:bg-white text-white px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <HomeIcon className="mr-2 size-5"></HomeIcon>
              <div>Dashboard</div>
            </div>
          </Link>
          <Link
            to="/classes"
            class="rounded-md  hover:text-sky-800 hover:bg-white text-white px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <AcademicCapIcon className="mr-2 size-5"></AcademicCapIcon>
              <div>Classes</div>
            </div>
          </Link>
          <Link
            to="/meetings"
            class="rounded-md  hover:text-sky-800 hover:bg-white text-white px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <AcademicCapIcon className="mr-2 size-5"></AcademicCapIcon>
              <div>Meetings</div>
            </div>
          </Link>
          <Link
            to="/students"
            class="rounded-md  hover:text-sky-800 hover:bg-white text-white px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <UserIcon className="mr-2 size-5"></UserIcon>
              <div>Students</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;
