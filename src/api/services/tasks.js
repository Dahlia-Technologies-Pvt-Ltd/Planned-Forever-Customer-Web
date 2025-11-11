import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getTasks = async (data) => {
  try {
    let response = await axios.get(GET.GET_TASK, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getTasksReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_TASKS_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addTask = async (data) => {
  try {
    let response = await axios.post(POST.TASK, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateTask = async (id, data) => {
  try {
    let response = await axios.post(`${POST.TASK}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteTask = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_TASK}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateTaskStatus = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_TASK_STATUS}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};




