import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getScheduleSmsList = async (data) => {
  try {
    let response = await axios.get(GET.GET_SCHEDULE_LIST, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const SendScheduleSms = async (data) => {
  try {
    let response = await axios.post(POST.SEND_SCHEDULE_SMS, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateSchedule = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_SCHEDULE}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteScheduleSms = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_SCHEDULE_SMS}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
