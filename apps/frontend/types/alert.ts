export interface IAlert {
  status: boolean,
  type: string,
  message: string | string[],
  color: string,
  icon: string
  title: string,
  location: "top" | "bottom" | "center"
}