export interface GeneralResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}
