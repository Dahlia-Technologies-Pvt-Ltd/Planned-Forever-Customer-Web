import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";


export const addQuickContact = async (data) => {
    try {
      let response = await axios.post(POST.ADD_QUICK_CONTACT, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const deleteQuickContact = async (data) => {
    try {
      let response = await axios.post(POST.DELETE_QUICK_CONTACT, data);
      return response;
    } catch (err) {
      throw err;
    }
  };