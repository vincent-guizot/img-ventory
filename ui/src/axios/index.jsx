import axios from "axios";
// import Swal from "sweetalert2";

const URL = import.meta.env.VITE_LINK;

async function getClasses(cb) {
  try {
    const results = await axios({
      method: "GET",
      url: import.meta.env.VITE_LINK + "/classes",
    });

    cb(results.data);
  } catch (err) {
    console.log(err);
  }
}

const getClassById = async (id, cb) => {
  try {
    const result = await axios({
      method: "GET",
      url: URL + `/classes/${id}`,
    });

    cb(result.data);
  } catch (err) {
    console.log(err);
  }
};

export { getClasses, getClassById };
