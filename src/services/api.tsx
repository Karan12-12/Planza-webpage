import axios,{ AxiosError } from "axios";
import type { AxiosResponse } from "axios";

const CLIENT_API = import.meta.env.VITE_BASE_URL;
// Create axios instance
const api = axios.create({
  baseURL: CLIENT_API,
  //   withCredentials: true,
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
});

export const GetServiceAPI = async (): Promise<AxiosResponse | unknown> => {
  try {
    const response = await api.get(`/service/getServicesWithoutToken`);

    return response;
  } catch (error) {
    return error;
  }
};

export const createVendorOnboarding = async (
  data: any,
): Promise<AxiosResponse | unknown> => {
  try {
    const response = await api.post(`/dash/vendorOnboard`, data);

    return response.data;
  } catch (error) {
      const err = error as AxiosError<any>;
    return err?.response?.data;
  }
};
