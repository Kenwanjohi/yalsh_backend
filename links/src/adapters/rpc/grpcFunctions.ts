import { ServerUnaryCall, sendUnaryData, status } from "@grpc/grpc-js";

import {
  CreateLinkRequest,
  CreateLinkResponse,
  GetLinksRequest,
  GetLinksResponse,
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

export const getLinks = (app: IAPIPort) => {
  return async (
    call: ServerUnaryCall<GetLinksRequest, GetLinksResponse>,
    callback: sendUnaryData<GetLinksResponse>
  ) => {
    try {
      const links = await app.getLinks(call.request.userId);
      callback(null, { links });
    } catch (error) {
      callback({
        code: status.UNKNOWN,
        details: "Unexpected error occurred",
      });
    }
  };
};
