export interface IApiResponse<T> {
  message: string;
  payload: T;
  status?: string;
  validation_result?: any;
}
