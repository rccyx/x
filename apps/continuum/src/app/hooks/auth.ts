import type { Optional } from "typyx";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { UserRo } from "@rccyx/api/rpc-models";
import { rpc } from "@rccyx/api/rpc-client";

export function useAuth(): {
  user: Optional<UserRo>;
  isLoading: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const { data: user, isLoading } = rpc.user.me.useQuery();
  const utils = rpc.useUtils();
  const logoutMutation = rpc.user.logout.useMutation();

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
