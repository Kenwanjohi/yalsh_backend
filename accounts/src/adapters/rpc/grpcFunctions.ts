import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "yalsh_protos/dist/accounts/accounts";
import { IAPIPort } from "../../ports/api";
import { userUpdate } from "../../application/entities/account";

export const createUser = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<CreateUserRequest, CreateUserResponse>,
    callback: sendUnaryData<CreateUserResponse>
  ) => {
    const { user_id, username } = await app.createUser(call.request);
    callback(null, { userId: user_id, username });
  };
};

export const updateUser = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<UpdateUserRequest, UpdateUserResponse>,
    callback: sendUnaryData<UpdateUserResponse>
  ) => {
    const user = userUpdate(call.request);
    const ok = await app.updateUser(user);
    callback(null, { ok });
  };
};
