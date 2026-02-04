import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const api = {
  post: async (
    link: string,
    data: any,
    headers?: AxiosRequestConfig<any>
  ): Promise<[AxiosResponse<any, any>, any]> => {
    try {
      let res = await axios.post(link, data, headers);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },
  put: async (
    link: string,
    data: any,
    headers?: AxiosRequestConfig<any>
  ): Promise<[AxiosResponse<any, any>, any]> => {
    try {
      let res = await axios.put(link, data, headers);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },
  get: async (
    link: string,
    headers?: AxiosRequestConfig<any>
  ): Promise<[AxiosResponse<any, any>, any]> => {
    try {
      let res = await axios.get(link, headers);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },
};
