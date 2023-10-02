import axios, { AxiosInstance, AxiosResponse } from 'axios';
import RestAdapter from './rest-adapter';

export default class AxiosAdapter implements RestAdapter {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL
    });
  }

  async get<T>(url: string, params?: unknown): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, {
        params
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error making GET request: ${error}`);
    }
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        url,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error making POST request: ${error}`);
    }
  }
}
