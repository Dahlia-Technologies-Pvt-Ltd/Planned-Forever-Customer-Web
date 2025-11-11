import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getCity = async (data) => {
    try {
      let response = await axios.get(GET.GET_CITY, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };