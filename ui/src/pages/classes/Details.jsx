import React, { useState, useEffect } from "react";

import { getClassById } from "../../axios";
import { useParams } from "react-router-dom";

function Details() {
  const { id } = useParams();
  const [classObj, setClass] = useState({});

  useEffect(() => {
    getClassById(id, (data) => {
      setClass(data);
    });
  }, []);

  return (
    <div className="w-full my-2 p-4">
      <div className="flex flex-row justify-between text my-2 p-2">
        <div>
          <p className="text-gray-700 text-sm"> Classes details</p>
          <p className="font-bold text-3xl">{classObj.name}</p>
        </div>
        <div>
          <p className="text-gray-700 text-sm">Price </p>
          <p className="font-bold text-3xl text-green-700">
            Rp. {classObj.price}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-5 my-3">
        <div className="border-t-4 border-t-sky-700 rounded-md p-3">
          <p className="text-sm text-gray-700">Status</p>
          <p
            className={`${
              classObj.status ? "text-green-700" : "text-red-700"
            } text-2xl font-bold`}
          >
            {classObj.status ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="border-t-4 border-t-sky-700 rounded-md p-3 ">
          <p className="text-sm text-gray-700">Total Meetings</p>
          <p className="text-2xl font-bold">
            {classObj.totalMeetings} meetings
          </p>
        </div>

        <div className="border-t-4 border-t-sky-700 rounded-md p-3 ">
          <p className="text-sm text-gray-700">Total Students</p>
          <p className="text-2xl font-bold">{classObj.totalStudents} people</p>
        </div>

        <div className="border-t-4 border-t-sky-700 rounded-md p-3 ">
          <p className="text-sm text-gray-700">Start Date</p>
          <p className="text-2xl font-medium">{classObj.startDate} </p>
        </div>

        <div className="border-t-4 border-t-sky-700 rounded-md p-3 ">
          <p className="text-sm text-gray-700">Finish Date</p>
          <p className="text-2xl font-medium">{classObj.finishDate} </p>
        </div>
      </div>

      <hr />
      <div className="grid grid-cols-3">
        <div className="">Meetings</div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Details;
