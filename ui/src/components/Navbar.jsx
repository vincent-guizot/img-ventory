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
      {/* <nav class="bg-gray-800">
        <div class="container mx-auto px-2 sm:px-6 lg:px-8">
          <div class="relative flex h-16 items-center justify-between">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button
                type="button"
                class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span class="absolute -inset-0.5"></span>
                <span class="sr-only">Open main menu</span>

                <svg
                  class="block size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
                <svg
                  class="hidden size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="flex flex-1 items-center justify-end sm:items-stretch sm:justify-start">
              <div class="hidden sm:ml-6 sm:block">
                <div class="flex space-x-4">
                  <Link
                    to="/"
                    class="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                    aria-current="page"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/classes"
                    class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Classes
                  </Link>
                  <Link
                    to="/meetings"
                    class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Meetings  
                  </Link>
                  <Link
                    to="/students"
                    class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Calendar
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </nav> */}
      <div className="grid h-full place-content-center bg-gray-100">
        <div className="">
          <ComputerDesktopIcon className="text-sky-700"></ComputerDesktopIcon>
        </div>
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            class="rounded-md text-sky-700 hover:text-white hover:bg-sky-700 px-3 py-2 text-sm font-medium text-white"
            aria-current="page"
          >
            <div className="flex flex-row">
              <HomeIcon className="mr-2 size-5"></HomeIcon>
              <div>Dashboard</div>
            </div>
          </Link>
          <Link
            to="/classes"
            class="rounded-md text-sky-700 hover:text-white hover:bg-sky-700 px-3 py-2 text-sm font-medium text-white"
            aria-current="page"
          >
            <div className="flex flex-row">
              <AcademicCapIcon className="mr-2 size-5"></AcademicCapIcon>
              <div>Classes</div>
            </div>
          </Link>
          <Link
            to="/meetings"
            class="rounded-md text-sky-700 hover:text-white hover:bg-sky-700 px-3 py-2 text-sm font-medium text-white"
            aria-current="page"
          >
            <div className="flex flex-row">
              <AcademicCapIcon className="mr-2 size-5"></AcademicCapIcon>
              <div>Meetings</div>
            </div>
          </Link>
          <Link
            to="/students"
            class="rounded-md text-sky-700 hover:text-white hover:bg-sky-700 px-3 py-2 text-sm font-medium text-white"
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
