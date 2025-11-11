import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const GetAllCar = async (data) => {
    try {
      let response = await axios.get(GET.GET_CAR, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  export const getCarReport = async (data) => {
    try {
      let response = await axios.get(GET.GET_CAR_REPORT, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  export const deleteCar = async (id) => {
    try {
      let response = await axios.delete(`${DELETE.DELETE_CAR}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const addCar = async (data) => {
    try {
      let response = await axios.post(POST.ADD_CAR, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const updateCar = async (id, data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_CAR}/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };