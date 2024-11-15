import React, { useState, useEffect } from "react";
import {
  InformationCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

import { Link } from "react-router-dom";
import { getClasses } from "../../axios";

function Home() {
  const [classes, setClasses] = useState([]);
 
  useEffect(() => {
    getClasses((data) => {
      setClasses(data)
    });
  });

  return (
    <>
      <div className="w-full my-2 p-4">
        <h1 className="text-sky-700 font-bold text-xl"> Classes List</h1>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Earum neque
          commodi velit quis recusandae dignissimos soluta quibusdam eius quo
          numquam expedita consequuntur maxime, tempora accusantium. Error
          perferendis facere ab possimus?
        </p>
        <hr />
        <div className="flex flex-row w-full my-2">
          <div className="flex-1"></div>
        </div>
        <div className="flex flex-row my-2">
          <div className="my-3 mr-2">
            <button className="rounded-xl px-3 py-2 text-sky-700 hover:text-white hover:bg-sky-700 border border-sky-100 font-medium">
              Active
            </button>
          </div>
          <div className="my-3 mr-2">
            <button className="rounded-xl px-3 py-2 text-sky-700 hover:text-white hover:bg-sky-700 border border-sky-100 font-medium">
              Inactive
            </button>
          </div>
          <div className="my-3 mr-2">
            <button className="rounded-xl px-3 py-2 text-sky-700 hover:text-white hover:bg-sky-700 border border-sky-100 font-medium">
              Total
            </button>
          </div>
        </div>

        <hr />
        <div className="w-full my-2">
          <div className="table border w-full">
            <div className="table-header-group text-center p-3 bg-sky-50 font-bold">
              <div className="table-row ">
                <div className="table-cell p-2">Id</div>
                <div className="table-cell p-2">Name</div>
                <div className="table-cell p-2">Total Meetings</div>
                <div className="table-cell ">Total Students</div>
                <div className="table-cell ">Status</div>
                <div className="table-cell ">Actions</div>
              </div>
            </div>
            <div className="table-row-group text-center">
              {classes.length > 0 ? (
                classes.map((clas) => {
                  const { id, name, totalMeetings, totalStudents, status } =
                    clas;
                  return (
                    <div className="table-row">
                      <div className="table-cell text-center p-2">{id}</div>
                      <div className="table-cell text-center p-2 font-medium text-md text-sky-700">
                        <div className="flex">
                          {name}
                          <Link to={`/classes/details/${id}`}>
                            <InformationCircleIcon className="ml-2 size-5"></InformationCircleIcon>
                          </Link>
                        </div>
                      </div>
                      <div className="table-cell text-center p-2">
                        {totalMeetings}
                      </div>
                      <div className="table-cell text-center p-2">
                        {totalStudents}
                      </div>
                      <div className="table-cell text-center p-2">
                        {status ? "Active" : ""}
                      </div>
                      <div className="table-cell text-center p-2">
                        <button className="rounded-md font-small px-2 py-1 border border-red-100 text-red-700 hover:text-white hover:bg-red-700">
                          Delete
                        </button>
                        
                        <button className="rounded-md font-small px-2 py-1 border border-blue-100 text-blue-700 hover:text-white hover:bg--700">
                          Edit
                        </button>

                        
                      </div>
                    </div>
                  );
                })
              ) : (
                <h1>Loading   </h1>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
