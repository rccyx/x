/** 
 * 
 * Name and convention should be going like this.
 The number one we gotta put is the resource name.
 It's either Pro or Singleton.
 If you gotta do an action over a single resource,
 for example, I just call it a user.
 We call it a user, and then we do the action.
 What we're gonna do right here?
 Create, delete, purge, remove, yank.
 Fucking bill, fucking pay, fucking do anything.
 A verb later.
 And then the verb after the part.
 If we have any action, for example,
 like the action itself, for example,
 it can either be a single verb,
 or it can be basically many,
 I would say, like, delete something,
 like delete plus, like a verb plus a noun,
 basically describing this stuff.
 And it's supposed to be unique
 because these things are IDs basically for the open API, right?
 

  Now, for the naming of the immune conventions, almost all of them are going to be almost
 like plural, unless they actually deserve to be singular, like "ah" or some single
 stuff like "health", but most of these end points, basically in rest definition, are
 going to be mostly likely plural.

 And schemas are basically ran as, the name of the schema is basically so simple.
 If it's a parameter, we append the name of the actual action itself in the contract,
 the ID, the action itself.
 Plus we add either header schema request, branch schema request, body schema request,
 query schema request, or schema response, that's it.
 It is the same action, the same shit mapping 1012, that's all it is, that's 101 mapping.



 * 
 
*/ import { c } from "../../ts-rest/root";
import { createContract } from "ts-rest-kit/core";
import {
  healthSchemaResponses,
  notificationCreateBodySchemaRequest,
  notificationCreateHeadersSchemaRequest,
  notificationCreateSchemaResponses,
  ossGetTextQuerySchemaRequest,
  ossGetTextSchemaResponses,
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
    headers: viewsDeleteWindowWithCutoffHeadersSchemaRequest,
    responses: viewsDeleteWindowWithCutoffSchemaResponses,
  },

  postsDeleteTrash: {
    method: "DELETE",
    path: v1.posts,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes all posts currently in the trash bin.",
    headers: postsDeleteTrashHeadersSchemaRequest,
    responses: postsDeleteTrashSchemaResponses,
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
    query: gpgQuerySchemaRequest.optional(),
    responses: gpgSchemaResponses,
  },

  debion: {
    method: "GET",
    path: v1.oss.debion,
    strictStatusCodes: true,
    summary: "Fetch Debion setup script",
    description:
      "Returns a raw text script for initializing the custom Debion login screen environment.",
    query: debionQuerySchemaRequest.optional(),
    responses: debionSchemaResponses,
  },

  whisper: {
    method: "GET",
    path: v1.oss.whisper,
    strictStatusCodes: true,
    summary: "Fetch Whisper setup script",
    description:
      "Returns a raw text script for configuring OpenAI's Whisper locally.",
    query: whisperQuerySchemaRequest.optional(),
    responses: whisperSchemaResponses,
  },
});
