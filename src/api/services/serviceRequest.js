import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";


export const getServiceRequests = async (data) => {
    try {
      let response = await axios.get(GET.GET_SERVICE_REQUEST, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  export const updateServiceStatus = async (id , data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_SERVICE_REQUEST}/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };
