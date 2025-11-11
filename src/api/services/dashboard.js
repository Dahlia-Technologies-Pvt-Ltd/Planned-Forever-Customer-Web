import { axios } from "../axios";
import { GET } from "../endpoints";

export const getStats = async (id) => {
  try {
    let response = await axios.get(`${GET.GET_STATS}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getTaskStatus = async (id) => {
  try {
    let response = await axios.get(`${GET.GET_TASK_STATUS}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getPendingTask = async (id) => {
  try {
    let response = await axios.get(`${GET.GET_PENDING_TASK}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};