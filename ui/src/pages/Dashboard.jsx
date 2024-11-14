import React from "react";

function DashboardHome() {
  return (
    <>
      <div className="w-full my-2 p-4">
        <h1 className="font-bold text-2xl">Dashboard</h1>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Earum neque
          commodi velit quis recusandae dignissimos soluta quibusdam eius quo
          numquam expedita consequuntur maxime, tempora accusantium. Error
          perferendis facere ab possimus?
        </p>
        <hr />
        <div className="grid grid-cols-4 gap-4 my-3">
          <div className="border-l-8 border-l-sky-700 rounded-md shadow hover:shadow-md">
            <div className="flex flex-row">
              <div className="flex-[0.7] p-3">
                <p className="text-xs"> Total Active Classes</p>
                <p className="text-sky-700 font-bold text-5xl">10</p>
              </div>
              <div className="flex-[0.3] bg-sky-50 p-0"></div>
            </div>
          </div>

          <div className="bg-gray-300 text-center p-2">Col 1</div>
          <div className="bg-gray-300 text-center p-2">Col 1</div>
          <div className="bg-gray-300 text-center p-2">Col 1</div>
          <div className="bg-gray-300 text-center p-2">Col 1</div>
          <div className="bg-gray-300 text-center p-2">Col 1</div>
        </div>
      </div>
    </>
  );
}

export default DashboardHome;
