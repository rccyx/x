import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // this tells the app: "once you fetch data, trust it for 15 seconds."
        // if another component asks for the same data within 15s,
        // don't hit the api again, just grab it from the local cache.
        staleTime: 15 * 1000,
      },
      dehydrate: {
        // the process of freezing the cache state on the server
        // so it can be sent to the browser.

        // superjson makes sure stuff like Dates or Maps don't break
        // when being turned into a string for the trip to the browser.
        serializeData: superjson.serialize,

        // this decides what actually gets sent to the browser.
        // we send successful queries OR queries that are still "pending"
        // so the browser can take over the loading state seamlessly.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",

        // next.js handles its own error redacting (hiding sensitive info).
        // we return false here because if we hide errors ourselves,
        // next.js might not realize a page is dynamic and break its own logic.
        shouldRedactErrors: () => {
          return false;
        },
      },
      hydrate: {
        // the process of the browser waking up,
        // taking that frozen string from the server, and turning it back
        // into real javascript objects (dates, etc) using superjson.
        deserializeData: superjson.deserialize,
      },
    },
  });
}
