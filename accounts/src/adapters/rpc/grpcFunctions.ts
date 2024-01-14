import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import {
  CreateUserRequest,
  CreateUserResponse,
} from "yalsh_protos/dist/accounts/accounts";

import { IAPIPort } from "../../ports/api";

export const createUser = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<CreateUserRequest, CreateUserResponse>,
    callback: sendUnaryData<CreateUserResponse>
  ) => {
    const { user_id, username } = await app.createUser(call.request);
    callback(null, { userId: user_id, username });
  };
};
