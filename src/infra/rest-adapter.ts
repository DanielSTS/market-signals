export default interface RestAdapter {
  get<T>(url: string, params?: unknown): Promise<T>;
  post<T>(url: string, data?: unknown): Promise<T>;
}
