import React, { useState } from "react";

function Edit() {
  const [input, setInput] = useState({
    name: "",
    price: 0,
    totalMeetings: 0,
    totalStudents: 0,
    status: true,
    meetings: [],
    students: [],
    courseType: "",
  });

  const submitHandler = (e) => {
    e.preventDefault()
    console.log(input)
  }

  return (
    <div className="w-full my-2 p-4">
      <div className="my-2 p-2">
        <h1 className="text-sky-700 font-bold text-xl">Add Class </h1>
        <p>Class </p>
      </div>
      <hr />

      <form action="">
        <div className="grid grid-cols-3">
          <div className="">
            <div class="my-5">
              <label
                className="my-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Class Name
              </label>
              <input
              onChange={(e) => setInput({name: e.target.value, ...input})}
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="name@flowbite.com"
                required
              />
            </div>
            <div class="my-5">
              <label
                className="my-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Price
              </label>
              <input
              onChange={(e) => setInput({price: e.target.value, ...input})}
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="name@flowbite.com"
                required
              />
            </div>
            <div class="my-5">
              <label className="my-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Course Type
              </label>
              <input
              onChange={(e) => setInput({courseType: e.target.value, ...input})}
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="ex: js, python, com"
                required
              />
            </div>
            <div className="my-5">
                <button 
                
                onClick={() => submitHandler()}
                className="rounded-md px-3 py-2 bg-sky-700 text-white hover:bg-sky-900">Submit</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Edit;
