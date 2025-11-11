import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const updateProfile = async (id, data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_PROFILE}/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };

  export const getUserDataById = async (id) => {
    try {
      let response = await axios.get(`${GET.GET_USER_BY_ID}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const resetPassword = async (data) => {
    try {
      let response = await axios.post(POST.RESET_PASSWORD, data);
      return response;
    } catch (err) {
      throw err;
    }
  };

    export const getEventsByNumber = async (id) => {
    try {
      let response = await axios.get(`${GET.GET_EVENTS_BY_NUMBER}`);
      return response;
    } catch (err) {
      throw err;
    }
  };