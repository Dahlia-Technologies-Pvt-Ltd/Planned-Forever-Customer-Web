import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getCalendarData = async (data) => {
  try {
    let response = await axios.get(GET.GET_CALENDAR, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const getPanchangCalendarData = async (data) => {
  try {
    let response = await axios.get(GET.GET_PANCHANG, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};