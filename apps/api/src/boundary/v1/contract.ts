import { createContract } from "../../adapters/restyx/framework/src/core";
import {
  healthSchemaResponses,
  gpgQuerySchemaRequest,
  gpgSchemaResponses,
  thyxQuerySchemaRequest,
  thyxSchemaResponses,
  whisperQuerySchemaRequest,
  remindersPushReminderBodySchemaRequest,
  remindersPushReminderHeadersSchemaRequest,
  remindersPushReminderSchemaResponses,
  notificationsPushEmailNotifBodySchemaRequest,
  notificationsPushEmailNotifHeadersSchemaRequest,
  notificationsPushEmailNotifSchemaResponses,
  bootstrapQuerySchemaRequest,
  bootstrapSchemaResponses,
  viewsPurgeWithCutoffHeadersSchemaRequest,
  viewsPurgeWithCutoffSchemaResponses,
  postPurgeTrashBinHeadersSchemaRequest,
  postsPurgeTrashBinSchemaResponses,
  whisperSchemaResponses,
} from "../../boundary/v1/models";
import { v1 } from "../../boundary/v1/uris";
import { c } from "../../adapters/restyx/root";

export const contract = createContract(c)({
  remindersPushReminder: {
    method: "POST",
    path: v1.reminders,
    strictStatusCodes: true,
    summary: "Create a reminder",
    description:
      "Creates a reminder using the provided headers and body payload.",
    headers: remindersPushReminderHeadersSchemaRequest,
    body: remindersPushReminderBodySchemaRequest,
    responses: remindersPushReminderSchemaResponses,
  },

  notificationsPushEmailNotif: {
    method: "POST",
    path: v1.notifications,
    strictStatusCodes: true,
    summary: "Send a notification",
    description:
      "Dispatches a system notification using the provided headers and body payload.",
    headers: notificationsPushEmailNotifHeadersSchemaRequest,
    body: notificationsPushEmailNotifBodySchemaRequest,
    responses: notificationsPushEmailNotifSchemaResponses,
  },

  viewsPurgeWithCutoff: {
    method: "DELETE",
    path: v1.views,
    strictStatusCodes: true,
    summary: "Purge the view window from all posts",
    description: "Deletes temporary view window data from all posts.",
    headers: viewsPurgeWithCutoffHeadersSchemaRequest,
    responses: viewsPurgeWithCutoffSchemaResponses,
  },

  postsPurgeTrashBin: {
    method: "DELETE",
    path: v1.posts,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes all posts currently in the trash bin.",
    headers: postPurgeTrashBinHeadersSchemaRequest,
    responses: postsPurgeTrashBinSchemaResponses,
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
    query: bootstrapQuerySchemaRequest,
    responses: bootstrapSchemaResponses,
  },

  gpg: {
    method: "GET",
    path: v1.oss.gpg,
    strictStatusCodes: true,
    summary: "Fetch public GPG key",
    description: "Returns my armored public GPG key as plain text.",
    query: gpgQuerySchemaRequest,
    responses: gpgSchemaResponses,
  },

  thyx: {
    method: "GET",
    path: v1.oss.thyx,
    strictStatusCodes: true,
    summary: "Fetch thyx setup script",
    description:
      "Returns a raw text script for initializing the custom thyx login screen screen theme.",
    query: thyxQuerySchemaRequest,
    responses: thyxSchemaResponses,
  },

  whisper: {
    method: "GET",
    path: v1.oss.whisper,
    strictStatusCodes: true,
    summary: "Fetch Whisper setup script",
    description:
      "Returns a raw text script for configuring OpenAI's Whisper locally.",
    query: whisperQuerySchemaRequest,
    responses: whisperSchemaResponses,
  },
});
