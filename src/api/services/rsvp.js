import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const markRsvp = async (data) => {
    try {
      let response = await axios.post(POST.MARK_RSVP, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const getRsvpReport = async (data) => {
    try {
      let response = await axios.get(GET.GET_RSVP_REPORT, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };