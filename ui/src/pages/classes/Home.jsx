import React from "react";

function Home() {
  return (
    <>
      <div className="text-center my-2 p-2">
        <h1 className="text-red-700 font-bold text-xl"> Classes List</h1>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Earum neque
          commodi velit quis recusandae dignissimos soluta quibusdam eius quo
          numquam expedita consequuntur maxime, tempora accusantium. Error
          perferendis facere ab possimus?
        </p>
        <hr />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-300 text-center p-2">Col 1</div>
        <div className="bg-gray-300 text-center p-2">Col 1</div>
        <div className="bg-gray-300 text-center p-2">Col 1</div>
        <div className="bg-gray-300 text-center p-2">Col 1</div>
      </div>
    </>
  );
}

export default Home;
