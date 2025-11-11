import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";


export const GetAllAllocateCar = async (data) => {
    try {
      let response = await axios.get(GET.GET_ALLOCATE_CAR, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const deleteAllocateCar = async (id) => {
    try {
      let response = await axios.delete(`${DELETE.DELETE_ALLOCATE_CAR}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const addAllocateCar = async (data) => {
    try {
      let response = await axios.post(POST.ADD_ALLOCATE_CAR, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const updateAllocateCar = async (id, data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_ALLOCATE_CAR}/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const getCarAllocateReport = async (data) => {
    try {
      let response = await axios.get(GET.GET_CAR_ALLOCATE_REPORT, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const getAvaiableCar = async (data) => {
    try {
      let response = await axios.get(GET.GET_AVAILABLE_CAR, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };