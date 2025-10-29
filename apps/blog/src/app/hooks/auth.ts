import type { Optional } from "ts-roids";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { UserRo } from "@ashgw/api/rpc-models";
import { rpcClient } from "@ashgw/api/rpc-client";

export function useAuth(): {
  user: Optional<UserRo>;
  isLoading: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const { data: user, isLoading } = rpcClient.user.me.useQuery();
  const utils = rpcClient.useUtils();
  const logoutMutation = rpcClient.user.logout.useMutation();

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    await utils.user.me.invalidate();
    router.refresh();
  }, [logoutMutation, router, utils.user.me]);

  return {
    user: user ?? null,
    isLoading,
    logout,
  };
}
