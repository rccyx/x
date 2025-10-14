import { c } from "../../ts-rest/root";
import { createContract } from "ts-rest-kit/core";
import {
  healthSchemaResponses,
  notificationCreateBodySchemaRequest,
  notificationCreateHeadersSchemaRequest,
  notificationCreateSchemaResponses,
  ossGetTextQuerySchemaRequest,
  ossGetTextSchemaResponses,
  postTrashDeleteHeadersSchemaRequest,
  postTrashDeleteSchemaResponses,
  postViewWindowDeleteHeadersSchemaRequest,
  postViewWindowDeleteSchemaResponses,
  reminderCreateBodySchemaRequest,
  reminderCreateHeadersSchemaRequest,
  reminderCreateSchemaResponses,
} from "../../transports/v1/models";
import { v1 } from "./uris";

export const contract = createContract(c)({
  reminderCreate: {
    method: "POST",
    path: v1.reminders,
    strictStatusCodes: true,
    summary: "Create a reminder",
    description:
      "Creates a reminder using the provided headers and body payload.",
    headers: reminderCreateHeadersSchemaRequest,
    body: reminderCreateBodySchemaRequest,
    responses: reminderCreateSchemaResponses,
  },

  notificationCreate: {
    method: "POST",
    path: v1.notifications,
    strictStatusCodes: true,
    summary: "Send a notification",
    description:
      "Dispatches a system notification using the provided headers and body payload.",
    headers: notificationCreateHeadersSchemaRequest,
    body: notificationCreateBodySchemaRequest,
    responses: notificationCreateSchemaResponses,
  },

  viewsDeleteWindowWithCutoff: {
    method: "DELETE",
    path: v1.views,
    strictStatusCodes: true,
    summary: "Purge the view window from all posts",
    description: "Deletes temporary view window data from all posts.",
    headers: postViewWindowDeleteHeadersSchemaRequest,
    responses: postViewWindowDeleteSchemaResponses,
  },

  postsDeleteTrash: {
    method: "DELETE",
    path: v1.posts,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes all posts currently in the trash bin.",
    headers: postTrashDeleteHeadersSchemaRequest,
    responses: postTrashDeleteSchemaResponses,
  },

  health: {
    method: "GET",
    path: v1.health,
    strictStatusCodes: true,
    summary: "Health check",
    description: "Simple liveness probe to verify the API is running.",
    responses: healthSchemaResponses,
  },

  bootstrap: {
    method: "GET",
    path: v1.oss.bootstrap,
    strictStatusCodes: true,
    summary: "Fetch bootstrap script",
    description:
      "Returns a raw text bootstrap script for initializing dotfiles setup.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },

  gpg: {
    method: "GET",
    path: v1.oss.gpg,
    strictStatusCodes: true,
    summary: "Fetch public GPG key",
    description: "Returns my armored public GPG key as plain text.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },

  debion: {
    method: "GET",
    path: v1.oss.debion,
    strictStatusCodes: true,
    summary: "Fetch Debion setup script",
    description:
      "Returns a raw text script for initializing the custom Debion login screen environment.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },

  whisper: {
    method: "GET",
    path: v1.oss.whisper,
    strictStatusCodes: true,
    summary: "Fetch Whisper setup script",
    description:
      "Returns a raw text script for configuring OpenAI's Whisper locally.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },
});
