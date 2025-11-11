import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const GetAllContactByGroup = async (data) => {
    try {
      let response = await axios.get(GET.GET_ALL_CONTACT_BY_GROUP, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const allocateGift = async (data) => {
    try {
      let response = await axios.post(POST.GIFT_ALLOCATE, data);
      return response;
    } catch (err) {
      throw err;
    }
  };