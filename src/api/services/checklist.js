import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const GetAllChecklist = async (data) => {
    try {
      let response = await axios.get(GET.GET_CHECKLIST, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const deleteChecklist = async (id) => {
    try {
      let response = await axios.delete(`${DELETE.DELETE_CHECKLIST}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const addChecklist = async (data) => {
    try {
      let response = await axios.post(POST.ADD_CHECKLIST, data);
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const updateChecklist = async (id, data) => {
    try {
      let response = await axios.post(`${POST.UPDATE_CHECKLIST}/${id}`, data);
      return response;
    } catch (err) {
      throw err;
    }
  };

  export const updateChecklistStatus = async (data) => {
    try {
      let response = await axios.post(POST.CHECKLIST_STATUS, data);
      return response;
    } catch (err) {
      throw err;
    }
  };