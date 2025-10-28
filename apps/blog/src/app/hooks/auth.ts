import type { Optional } from "ts-roids";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { logger } from "@ashgw/logger";

import type { UserRo } from "@ashgw/api/rpc";
import { rpcClientSide } from "@ashgw/api/trpc";

export function useAuth(): {
  user: Optional<UserRo>;
  isLoading: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const { data: user, isLoading } = rpcClientSide.user.me.useQuery();
  const utils = rpcClientSide.useUtils();
  const logoutMutation = rpcClientSide.user.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      await utils.user.me.invalidate();
      router.refresh();
    } catch (error) {
      logger.error("Logout failed", { error });
    }
  }, [logoutMutation, router, utils.user.me]);

  return {
    user: user ?? null,
    isLoading,
    logout,
  };
}
