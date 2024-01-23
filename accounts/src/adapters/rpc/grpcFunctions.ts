import grpc, { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import {
  AuthUserRequest,
  AuthUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  GetUserProfileRequest,
  GetUserProfileResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "yalsh_protos/dist/accounts/accounts";
import { IAPIPort } from "../../ports/api";
import { userUpdate } from "../../application/entities/account";
import { Errors } from "../../errors";

export const createUser = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<CreateUserRequest, CreateUserResponse>,
    callback: sendUnaryData<CreateUserResponse>
  ) => {
    try {
      const { user_id, username } = await app.createUser(call.request);
      callback(null, { userId: user_id, username });
    } catch (error) {
      callback({
        code: grpc.status.UNKNOWN,
        details: "Unexpected error occurred",
      });
    }
  };
};

export const getUserProfile = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<GetUserProfileRequest, GetUserProfileResponse>,
    callback: sendUnaryData<GetUserProfileResponse>
  ) => {
    try {
      const user = await app.getUserProfile(call.request.userId);
      callback(null, user);
    } catch (error) {
      callback({
        code: grpc.status.UNKNOWN,
        details: "Unexpected error occurred",
      });
    }
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

export const deleteUser = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<DeleteUserRequest, DeleteUserResponse>,
    callback: sendUnaryData<DeleteUserResponse>
  ) => {
    const ok = await app.deleteUser(call.request.userId);
    callback(null, { ok });
  };
};

export const authenticateUser = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<AuthUserRequest, AuthUserResponse>,
    callback: sendUnaryData<AuthUserResponse>
  ) => {
    try {
      const user = await app.authenticateUser(call.request);
      callback(null, user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === Errors.IncorrectCredentials) {
          callback(
            { code: grpc.status.UNAUTHENTICATED, details: error.message },
            {}
          );
          return;
        }
        callback(
          { code: grpc.status.UNKNOWN, details: "Unexpected error occurred" },
          {}
        );
      }
      callback(
        { code: grpc.status.UNKNOWN, details: "Unexpected error occurred" },
        {}
      );
    }
  };
};
