import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";


export const GetAllUsers = async (data) => {
    try {
      let response = await axios.get(GET.GET_USERS, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };



  export const deleteUser = async (id) => {
    try {
      let response = await axios.delete(`${DELETE.DELETE_USER}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const addUser = async (data) => {
    try {
      let response = await axios.post(POST.ADD_USER, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const updateUser = async (id, data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_USER}/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const ImportUserExcel = async (data) => {
    try {
      let response = await axios.post(POST.BULK_USER_IMPORT, data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };
  