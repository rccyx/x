import superjson from "superjson";

export const transformer = superjson as {
  serialize: typeof superjson.serialize;
  deserialize: typeof superjson.deserialize;
};
