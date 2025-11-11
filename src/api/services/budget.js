import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getBudget = async (id) => {
    try {
      let response = await axios.get(`${GET.GET_BUDGET_BY_ID}/${id}`);
      return response;
    } catch (err) {
      throw err;
    }
  };

  export const addBudget = async (data) => {
    try {
      let response = await axios.post(POST.ADD_BUDGET, data);
      return response;
    } catch (err) {
      throw err;
    }
  };