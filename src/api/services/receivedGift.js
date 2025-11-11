import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";


export const getReceivedGifts = async (data) => {
    try {
      let response = await axios.get(GET.GET_RECEIVED_GIFT, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const addReceivedGifts  = async (data) => {
    try {
      let response = await axios.post(POST.ADD_RECEIVED_GIFT, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const updateReceivedGifts  = async (id, data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_RECEIVED_GIFT }/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };
  
  export const deleteReceivedGifts  = async (id) => {
    try {
      let response = await axios.delete(`${DELETE.DELETE_RECEIVED_GIFT}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const getReceviedgiftReport = async (data) => {
    try {
      let response = await axios.get(GET.GET_RECEIVED_GIFT_REPORT, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };
  