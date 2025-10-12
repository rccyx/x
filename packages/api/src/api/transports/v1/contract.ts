import { c } from "~/api/ts-rest/root";
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
} from "~/api/transports/v1/models";
import { v1endpoints } from "~/api/transports/v1/endpoints";

export const contract = createContract(c)({
  reminderCreate: {
    method: "POST",
    path: v1endpoints.reminder,
    strictStatusCodes: true,
    summary: "Create reminder",
    description:
      "Creates a reminder using the provided headers and body payload.",
    headers: reminderCreateHeadersSchemaRequest,
    body: reminderCreateBodySchemaRequest,
    responses: reminderCreateSchemaResponses,
  },

  notificationCreate: {
    method: "POST",
    path: v1endpoints.notification,
    strictStatusCodes: true,
    summary: "Send notification",
    description:
      "Dispatches a system notification using the provided headers and body payload.",
    headers: notificationCreateHeadersSchemaRequest,
    body: notificationCreateBodySchemaRequest,
    responses: notificationCreateSchemaResponses,
  },

  postDeleteViewWindow: {
    method: "DELETE",
    path: v1endpoints.post.viewWindow,
    strictStatusCodes: true,
    summary: "Purge view window data",
    description: "Deletes cached or temporary view window data from the blog.",
    headers: postViewWindowDeleteHeadersSchemaRequest,
    responses: postViewWindowDeleteSchemaResponses,
  },

  postDeleteTrash: {
    method: "DELETE",
    path: v1endpoints.post.trash,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes all posts currently in the trash bin.",
    headers: postTrashDeleteHeadersSchemaRequest,
    responses: postTrashDeleteSchemaResponses,
  },

  health: {
    method: "GET",
    path: v1endpoints.health,
    strictStatusCodes: true,
    summary: "Health check",
    description: "Simple liveness probe to verify the API is running.",
    responses: healthSchemaResponses,
  },

  bootstrap: {
    method: "GET",
    path: v1endpoints.oss.bootstrap,
    strictStatusCodes: true,
    summary: "Fetch bootstrap script",
    description:
      "Returns a raw text bootstrap script for initializing dotfiles setup.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },

  gpg: {
    method: "GET",
    path: v1endpoints.oss.gpg,
    strictStatusCodes: true,
    summary: "Fetch public GPG key",
    description: "Returns my armored public GPG key as plain text.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },

  debion: {
    method: "GET",
    path: v1endpoints.oss.debion,
    strictStatusCodes: true,
    summary: "Fetch Debion setup script",
    description:
      "Returns a raw text script for initializing the custom Debion login screen environment.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },

  whisper: {
    method: "GET",
    path: v1endpoints.oss.whisper,
    strictStatusCodes: true,
    summary: "Fetch Whisper setup script",
    description:
      "Returns a raw text script for configuring OpenAI's Whisper locally.",
    query: ossGetTextQuerySchemaRequest.optional(),
    responses: ossGetTextSchemaResponses,
  },
});
