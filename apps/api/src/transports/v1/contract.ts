/** 
 * TODO: use the shit from the blog to name especially across domains
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


 The naming convention of the files when it comes to functions should be super simple,
 which is if we get too many functions, of course, we have to create different files
 for each single function.
 For example, for our createReminder function, we have to create a different file called
 createReminders you can see right there.
 We're going to have to do this like for small files, small functionality, it will be an
 overhead.
 But again, if the file gets too big, we have to match the file example exactly with a
 function.
 If we normalize the name, of course, make it all matter of case, instead of words tied
 to each other, you got to create a - that's the only difference.
 That's it.
 The same fucking name keeps it.
 And also, we export one constant in the index.
 One constant represents the folder that we have on your functions.
 So if it's posts, it is posts.
 We don't change it.
 We don't change it at all.
 This is the convention.


 the contract defunes the operationId, and we use it to name our functions, and operations 
 basiclal yif the operation id is called, notificationsCreateSchemaResponses it means we will call a function from the notifications called 
 notificationsCreateNotification, another exmaple is postsPurgeTrashBin, it means we will call a function from the posts called purgeTrashBin, 

(notice how the operation id ALWAYS starts wit hthe resource, in plural)


the operation id is structured as resource(s)<unique-action>, where unqiue action is the unqiue action within that given resource

 functions do mirror REST resources, where we make it plural, Post is a single databse entity right? and in teh core we have it as 

 PostService, but actually here in rest we have to make it plural, thus the functions package has directories called posts, reminders, notifications etc


 it maps 1:1 to /notifications from th rest endpoint, tho the convention, now of, we can break the conveion if the resrouce can never be plural for exmaple 

 if it's  standalone thing like health it's ok, theree's no healths.


 anywys, the schema basiclaly shoudl be under the models/ package, where each sub directory under models is named <resource(s)>,
 
 
 so it becomes /models/resources(s), e.g: /models/posts or /models/health

 in models we have two things, reponses.ts & requests.ts, where index.ts exports them both, 

 we separate handler responses from full responses because handlers only run after all middlewares have passed, so they only care about their own success or internal errors. the full responses include middleware errors too, since the user might get rate-limited or unauthenticated before the handler runs. this makes the contract complete for clients while keeping handler logic clean and isolated.



Responses: <operationId>SchemaResponses (values)
Request: <operationId><Header/Query/Params/Body>SchemaRequest (value)

// for types we just remove the word schema & make the first letter Uppercase
Responses: <OperationId>Responses (types), z.infer<typeof <operationId>SchemaResponses>
Request: <OperationId><Header/Query/Params/Body>Request (type), z.infer<typeof <operationId><Header/Query/Params/Body>SchemaRequest>

(ofc if they get too many, u can just create sub folders that create respones.ts & requests.ts, folders should be the <unique-action>)
and we just export them normally

we start with one file first, sometimes just index.ts and then scale as needed


/models/posts/ <resource(s)>
          update-post.ts  <unique-action>
          /get-post
              / index.ts
          /get-admin-posts 
              / index.ts
          /get-public-posts
              / requests.ts
              / responses.ts
              / index.ts
          .get-post-cards
          .purge-trashed
          /....

but usually u really dont need seperate responses.ts and requests.ts since index.ts is light enough

tho keep files light meaning never put the responese/requets one more than one action per file since it convoluts it

for functions tho, 
the stucture is as ofllows, models folder has nested folders named as resources(s),functions folder has nested folders named as resources(s) too, same mapping 

like this 
functions:
  - [resources(s)]: // for example reminders or health
    - [<unique-action>.ts] // for exmaple create-one.ts (), each containing ONE exported function named uniqueAction(), I REPEAT ONE FUNCTION EPXORTED
    - index.ts, here we export one constant that holds all the functions of this reources's function, named as resource(s)
                for exmaple export const posts = { createPost }
                            export const health = { check }                  
                            export const <resource(s)> = { <uniqueAction> }
                          



functions basically are thin wrappers around a call to the core, since this is rest we have av versioned API, meaning we cannot just 

we cannot use core /models, we can only call core/services, why? if we reuse the models we never know if our contract changes

REST is public facing and versioned, meaning we're not allowed to break our contract to ppl and services using it, thus, we just model w


what we recieve and what we output and lock it in, if we launch and u need to update the API, move ot version two & so on,



REST APIs are externally consumed, meaning we do not pipe models directly from core, we replicate and copy & version then deprecate


THE HANDLER TYPE IN THE HANDLER RESPONSES, IS ALWAYS EXPORTED BUT I'S SCHEMA ISNT 



 
*/ import { c } from "../../ts-rest/root";
import { createContract } from "ts-rest-kit/core";
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
} from "../../transports/v1/models";
import { v1 } from "../../transports/v1/uris";

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
