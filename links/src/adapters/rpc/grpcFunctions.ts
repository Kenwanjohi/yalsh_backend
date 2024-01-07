import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import {
  CreateLinkRequest,
  CreateLinkResponse,
} from "yalsh_protos/dist/links/links";
import { IAPIPort } from "../../ports/api";
import { newLink } from "../../application/entities/link";

export const createLink = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<CreateLinkRequest, CreateLinkResponse>,
    callback: sendUnaryData<CreateLinkResponse>
  ) => {
    const linkItem = newLink(call.request);
    const linkId = await app.createLink(linkItem);
    callback(null, { linkId });
  };
};
