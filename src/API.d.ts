/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace API {
  type BaseResponse<T = any> = {
    code: number;
    data: T;
    message: string;
  };
}
