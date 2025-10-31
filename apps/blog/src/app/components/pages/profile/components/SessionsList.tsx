"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, XCircle } from "@rccyx/design/icons";
import { toast } from "@rccyx/design/ui";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Loading,
  TableRow,
} from "@rccyx/design/ui";

import { rpcClient } from "@rccyx/api/rpc-client";

interface SessionsListProps {
  currentSessionId: string;
}

export function SessionsList({ currentSessionId }: SessionsListProps) {
  const [loadingSessionIds, setLoadingSessionIds] = useState<Set<string>>(
    new Set(),
  );
  const [terminatingAllSessions, setTerminatingAllSessions] = useState(false);

  const router = useRouter();
  const utils = rpcClient.useUtils();

  const { data: sessions = [], isLoading } =
    rpcClient.user.listAllSessions.useQuery();

  const logoutMutation = rpcClient.user.logout.useMutation();

  const hardLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      await Promise.allSettled([
        utils.user.me.invalidate(),
        utils.user.listAllSessions.invalidate(),
      ]);
      router.replace("/login");
    }
  };

  const setSessionLoading = (sessionId: string, state: boolean) => {
    setLoadingSessionIds((prev) => {
      const next = new Set(prev);
      if (state) next.add(sessionId);
      else next.delete(sessionId);
      return next;
    });
  };

  const terminateAllSessionsMutation =
    rpcClient.user.terminateAllActiveSessions.useMutation({
      onMutate: () => setTerminatingAllSessions(true),
      onSuccess: async () => {
        toast.success("All sessions terminated");
        await hardLogout();
      },
      onError: (error) => {
        setTerminatingAllSessions(false);
        toast.error(error.message);
      },
      onSettled: () => {
        setTerminatingAllSessions(false);
      },
    });

  const terminateSpecificSessionMutation =
    rpcClient.user.terminateSpecificSession.useMutation({
      onMutate: ({ sessionId }) => setSessionLoading(sessionId, true),
      onSuccess: async (_data, { sessionId }) => {
        toast.success("Session terminated");
        if (sessionId === currentSessionId) {
          await hardLogout();
          return;
        }
        await utils.user.listAllSessions.invalidate();
        router.refresh();
      },
      onError: (error, { sessionId }) => {
        setSessionLoading(sessionId, false);
        toast.error(error.message);
      },
      onSettled: (_data, _err, vars) => {
        if (vars.sessionId) setSessionLoading(vars.sessionId, false);
      },
    });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
        <Shield className="mb-2 h-12 w-12 opacity-50" />
        <p>No active sessions</p>
      </div>
    );
  }

  const formatDateTime = (date: Date | string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px]">Created</TableHead>
              <TableHead className="w-[220px]">Last activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const isRowLoading =
                loadingSessionIds.has(session.id) || terminatingAllSessions;
              const isCurrent = currentSessionId === session.id;

              return (
                <TableRow
                  key={session.id}
                  className="group hover:bg-accent/55"
                  aria-current={isCurrent ? "true" : "false"}
                >
                  <TableCell className="font-medium">
                    {formatDateTime(session.createdAt)}
                  </TableCell>
                  <TableCell>{formatDateTime(session.updatedAt)}</TableCell>
                  <TableCell>
                    <Badge
                      size={"sm"}
                      appearance={"outlineFilled"}
                      tone={session.isExpired ? "destructive" : "success"}
                    >
                      {session.isExpired
                        ? "Expired"
                        : isCurrent
                          ? "Active • This device"
                          : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive:outline"
                      onClick={() =>
                        terminateSpecificSessionMutation.mutate({
                          sessionId: session.id,
                        })
                      }
                      disabled={isRowLoading}
                      className="opacity-70 transition-opacity group-hover:opacity-100"
                      title={
                        isCurrent
                          ? "Terminate current device session"
                          : "Terminate session"
                      }
                    >
                      {isRowLoading ? (
                        <Loading />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Terminate
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-semibold">
          {sessions.length} active{" "}
          {sessions.length === 1 ? "session" : "sessions"}
        </p>
        <Button
          variant="destructive:outline"
          onClick={() => terminateAllSessionsMutation.mutate()}
          disabled={terminatingAllSessions}
          className="relative"
        >
          {terminatingAllSessions ? (
            <Loading />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Terminate all
        </Button>
      </div>
    </div>
  );
}
