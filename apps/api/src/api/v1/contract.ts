import { c } from "../../ts-rest/root";
import { createContract } from "ts-rest-kit/core";
import {
  healthSchemaResponses,
  notificationCreateBodySchemaDto,
  notificationCreateHeadersSchemaDto,
  notificationCreateSchemaResponses,
  ossGetTextQuerySchemaDto,
  ossGetTextSchemaResponses,
  postTrashDeleteHeadersSchemaDto,
  postTrashDeleteSchemaResponses,
  postViewWindowDeleteHeadersSchemaDto,
  postViewWindowDeleteSchemaResponses,
  reminderCreateBodySchemaDto,
  reminderCreateHeadersSchemaDto,
  reminderCreateSchemaResponses,
} from "~/api/v1/models";
import { endpoints } from "~/api/v1/endpoints";

export const contract = createContract(c)({
  reminderCreate: {
    method: "POST",
    path: endpoints.reminder,
    strictStatusCodes: true,
    summary: "Create reminder",
    description:
      "Creates a reminder using the provided headers and body payload.",
    headers: reminderCreateHeadersSchemaDto,
    body: reminderCreateBodySchemaDto,
    responses: reminderCreateSchemaResponses,
  },

  notificationCreate: {
    method: "POST",
    path: endpoints.notification,
    strictStatusCodes: true,
    summary: "Send notification",
    description:
      "Dispatches a system notification using the provided headers and body payload.",
    headers: notificationCreateHeadersSchemaDto,
    body: notificationCreateBodySchemaDto,
    responses: notificationCreateSchemaResponses,
  },

  postDeleteViewWindow: {
    method: "DELETE",
    path: endpoints.post.viewWindow,
    strictStatusCodes: true,
    summary: "Purge view window data",
    description: "Deletes cached or temporary view window data from the blog.",
    headers: postViewWindowDeleteHeadersSchemaDto,
    responses: postViewWindowDeleteSchemaResponses,
  },

  postDeleteTrash: {
    method: "DELETE",
    path: endpoints.post.trash,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes all posts currently in the trash bin.",
    headers: postTrashDeleteHeadersSchemaDto,
    responses: postTrashDeleteSchemaResponses,
  },

  health: {
    method: "GET",
    path: endpoints.health,
    strictStatusCodes: true,
    summary: "Health check",
    description: "Simple liveness probe to verify the API is running.",
    responses: healthSchemaResponses,
  },

  bootstrap: {
    method: "GET",
    path: endpoints.oss.bootstrap,
    strictStatusCodes: true,
    summary: "Fetch bootstrap script",
    description:
      "Returns a raw text bootstrap script for initializing dotfiles setup.",
    query: ossGetTextQuerySchemaDto.optional(),
    responses: ossGetTextSchemaResponses,
  },

  gpg: {
    method: "GET",
    path: endpoints.oss.gpg,
    strictStatusCodes: true,
    summary: "Fetch public GPG key",
    description: "Returns my armored public GPG key as plain text.",
    query: ossGetTextQuerySchemaDto.optional(),
    responses: ossGetTextSchemaResponses,
  },

  debion: {
    method: "GET",
    path: endpoints.oss.debion,
    strictStatusCodes: true,
    summary: "Fetch Debion setup script",
    description:
      "Returns a raw text script for initializing the custom Debion login screen environment.",
    query: ossGetTextQuerySchemaDto.optional(),
    responses: ossGetTextSchemaResponses,
  },

  whisper: {
    method: "GET",
    path: endpoints.oss.whisper,
    strictStatusCodes: true,
    summary: "Fetch Whisper setup script",
    description:
      "Returns a raw text script for configuring OpenAI's Whisper locally.",
    query: ossGetTextQuerySchemaDto.optional(),
    responses: ossGetTextSchemaResponses,
  },
});
