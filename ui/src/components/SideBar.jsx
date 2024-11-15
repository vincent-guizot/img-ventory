import React from "react";

import { Link } from "react-router-dom";

import {
  AcademicCapIcon,
  UserIcon,
  HomeIcon,
  ComputerDesktopIcon,
  CogIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";

import logo from "../assets/1.jpg";

function Navbar() {
  return (
    <>
      <div className="flex flex-col items-center justify-between w-50 h-full bg-white rounded-2xl">
        <div className="flex-[0.3] w-48">
          {/* <ComputerDesktopIcon className="size-10"></ComputerDesktopIcon> */}
          <img className="rounded-2xl" src={logo} />
        </div>
        <div className="flex flex-col flex-[0.65] gap-4">
          <Link
            to="/"
            class="rounded-md hover:text-s hover:bg-sky-800 text-sky-800 px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <HomeIcon className="mr-2 size-5"></HomeIcon>
              <div>Dashboard</div>
            </div>
          </Link>
          <Link
            to="/classes"
            class="rounded-md  hover:text-white hover:bg-sky-800 text-sky-800 px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <AcademicCapIcon className="mr-2 size-5"></AcademicCapIcon>
              <div>Classes</div>
            </div>
          </Link>
          <Link
            to="/meetings"
            class="rounded-md  hover:text-white hover:bg-sky-800 text-sky-800 px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <AcademicCapIcon className="mr-2 size-5"></AcademicCapIcon>
              <div>Meetings</div>
            </div>
          </Link>
          <Link
            to="/students"
            class="rounded-md  hover:text-white hover:bg-sky-800 text-sky-800 px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <UserIcon className="mr-2 size-5"></UserIcon>
              <div>Students</div>
            </div>
          </Link>
          <Link
            to="/tasks"
            class="rounded-md  hover:text-white hover:bg-sky-800 text-sky-800 px-3 py-2 text-sm font-medium"
            aria-current="page"
          >
            <div className="flex flex-row">
              <PencilIcon className="mr-2 size-5"></PencilIcon>
              <div>Tasks</div>
            </div>
          </Link>
        </div>
        <div className="flex-[0.05]">
          <div className="flex">
            <CogIcon className="mr-2 size-5"></CogIcon> <div>Settings</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
