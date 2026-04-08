"use client";
import type { QueryClient } from "@tanstack/react-query";
import type { Optional } from "typyx";
import { createTRPCReact } from "@trpc/react-query";

import { makeQueryClient } from "./query-client";
import type { AppRouter } from "../../../../boundary/rpc/router";

// on the client, we want exactly ONE cache. if we created a new one
// on every render, your app would flicker and re-fetch everything constantly.
let clientQueryClientSingleton: Optional<QueryClient> = null;

// simple way to know if we are currently executing on the server or in the browser.
const isServer = typeof window === "undefined";

export function getOptimizedQueryClient() {
  if (isServer) {
    // server: always make a new query client.
    // why? because we don't want "user a" to accidentally see "user b's"
    // cached data. each server request gets its own fresh, empty bucket.
    return makeQueryClient();
  }

  // browser: use the singleton pattern.
  // if we already have a client, return it. if not, make it, save it, and return it.
  // this keeps your cache alive as the user navigates between pages.
  return (clientQueryClientSingleton ??= makeQueryClient());
}

// the hook generator
// this is the one you'll use in react. it creates the rpc object which contains
// all the hooks (useQuery, useMutation, etc.) typed specifically to your backend.
export const rpc = createTRPCReact<AppRouter>();
