"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  SurfaceCard,
  toast,
  Checkbox,
} from "@ashgw/design/ui";

import {
  twoFactorEnableSchemaDto,
  twoFactorGetTotpUriSchemaDto,
  twoFactorVerifyTotpSchemaDto,
  twoFactorDisableSchemaDto,
  twoFactorGenerateBackupCodesSchemaDto,
  twoFactorVerifyBackupCodeSchemaDto,
} from "@ashgw/api/rpc-models";

import type {
  TwoFactorEnableDto,
  TwoFactorGetTotpUriDto,
  TwoFactorVerifyTotpDto,
  TwoFactorDisableDto,
  TwoFactorGenerateBackupCodesDto,
  TwoFactorVerifyBackupCodeDto,
} from "@ashgw/api/rpc-models";

import { trpcClientSide } from "@ashgw/api/trpc";

/* utils */
function parseTotpSecret(totpURI: string): string | null {
  try {
    const qs = totpURI.split("?")[1];
    if (!qs) return null;
    const params = new URLSearchParams(qs);
    return params.get("secret");
  } catch {
    return null;
  }
}

function CopyableRow({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={value} className="font-mono" />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void navigator.clipboard.writeText(value);
          toast.success("Copied");
        }}
      >
        Copy
      </Button>
    </div>
  );
}

export function TwoFactorEnableCard() {
  const form = useForm<TwoFactorEnableDto>({
    resolver: zodResolver(twoFactorEnableSchemaDto),
    defaultValues: { password: "" },
    mode: "onChange",
  });

  const [secret, setSecret] = React.useState<string | null>(null);
  const [backupCodes, setBackupCodes] = React.useState<string[] | null>(null);

  const enable = trpcClientSide.user.enableTwoFactor.useMutation({
    onSuccess: (data) => {
      const s = parseTotpSecret(data.totpURI);
      setSecret(s);
      setBackupCodes(data.backupCodes);
      toast.success("Two factor enabled");
      form.reset({ password: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <SurfaceCard className="w-full" animation={"none"}>
      <h2 className="mb-2 text-xl font-semibold">Enable TOTP</h2>
      <p className="text-dim-300 mb-6 text-sm font-semibold">
        We will show the raw secret. Add it to your authenticator or store it
        offline.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => enable.mutate(values))}
          className="space-y-4"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={enable.isPending}>
              {enable.isPending ? "Enabling…" : "Enable 2FA"}
            </Button>
          </div>
        </form>
      </Form>

      {secret && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Your TOTP secret</h3>
          <CopyableRow value={secret} />
          <p className="text-dim-300 text-xs">
            Keep this safe. Anyone with this can generate valid codes.
          </p>
        </div>
      )}

      {backupCodes && backupCodes.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Backup codes</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {backupCodes.map((c) => (
              <Input key={c} readOnly value={c} className="font-mono" />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(backupCodes.join("\n"));
                toast.success("Backup codes copied");
              }}
            >
              Copy all
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const blob = new Blob([backupCodes.join("\n")], {
                  type: "text/plain",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "backup-codes.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download .txt
            </Button>
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}

/* Reveal secret (for already enabled) */
export function TwoFactorRevealSecretCard() {
  const form = useForm<TwoFactorGetTotpUriDto>({
    resolver: zodResolver(twoFactorGetTotpUriSchemaDto),
    defaultValues: { password: "" },
    mode: "onChange",
  });
  const [secret, setSecret] = React.useState<string | null>(null);

  const query = trpcClientSide.user.getTwoFactorTotpUri.useQuery(
    form.getValues(),
    { enabled: false },
  );

  const runIt = async () => {
    const { password } = form.getValues();
    if (!password) {
      form.setError("password", { message: "Password is required" });
      return;
    }
    const res = await query.refetch();
    if (res.data) {
      setSecret(parseTotpSecret(res.data.totpURI));
      toast.success("Secret revealed");
      form.reset({ password: "" });
    } else if (res.error) {
      toast.error(res.error.message);
    }
  };

  return (
    <SurfaceCard className="w-full" animation={"none"}>
      <h2 className="mb-2 text-xl font-semibold">Reveal TOTP secret</h2>
      <p className="text-dim-300 mb-6 text-sm font-semibold">
        If 2FA is already enabled, re enter your password to view the secret
        again.
      </p>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runIt();
          }}
          className="space-y-4"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit">Reveal</Button>
          </div>
        </form>
      </Form>
      {secret && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Secret</h3>
          <CopyableRow value={secret} />
        </div>
      )}
    </SurfaceCard>
  );
}

/* Verify TOTP code */
export function TwoFactorVerifyTotpCard() {
  const form = useForm<TwoFactorVerifyTotpDto>({
    resolver: zodResolver(twoFactorVerifyTotpSchemaDto),
    defaultValues: { code: "", trustDevice: false },
    mode: "onChange",
  });

  const verify = trpcClientSide.user.verifyTwoFactorTotp.useMutation({
    onSuccess: () => {
      toast.success("TOTP verified");
      form.reset({ code: "", trustDevice: false });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <SurfaceCard className="w-full" animation={"none"}>
      <h2 className="mb-2 text-xl font-semibold">Verify TOTP</h2>
      <p className="text-dim-300 mb-6 text-sm font-semibold">
        Enter a current code from your authenticator. Optionally trust this
        device.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => verify.mutate(v))}
          className="space-y-4"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>6–10 digit code</FormLabel>
                <FormControl>
                  <Input placeholder="123456" inputMode="numeric" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trustDevice"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                  <FormLabel>Trust this device</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={verify.isPending}>
              {verify.isPending ? "Verifying…" : "Verify"}
            </Button>
          </div>
        </form>
      </Form>
    </SurfaceCard>
  );
}

/* Backup codes (generate + verify) */
export function TwoFactorBackupCodesCard() {
  const genForm = useForm<TwoFactorGenerateBackupCodesDto>({
    resolver: zodResolver(twoFactorGenerateBackupCodesSchemaDto),
    defaultValues: { password: "" },
    mode: "onChange",
  });
  const [codes, setCodes] = React.useState<string[] | null>(null);

  const generate = trpcClientSide.user.generateTwoFactorBackupCodes.useMutation(
    {
      onSuccess: (data) => {
        setCodes(data.backupCodes);
        toast.success("New backup codes generated");
        genForm.reset({ password: "" });
      },
      onError: (e) => toast.error(e.message),
    },
  );

  const verifyForm = useForm<TwoFactorVerifyBackupCodeDto>({
    resolver: zodResolver(twoFactorVerifyBackupCodeSchemaDto),
    defaultValues: { code: "", trustDevice: false, disableSession: false },
    mode: "onChange",
  });
  const verify = trpcClientSide.user.verifyTwoFactorBackupCode.useMutation({
    onSuccess: () => {
      toast.success("Backup code accepted");
      verifyForm.reset({ code: "", trustDevice: false, disableSession: false });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <SurfaceCard className="w-full" animation={"none"}>
      <h2 className="mb-2 text-xl font-semibold">Backup codes</h2>
      <p className="text-dim-300 mb-6 text-sm font-semibold">
        Generate one time codes you can use if you lose access to your
        authenticator.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Generate</h3>
          <Form {...genForm}>
            <form
              onSubmit={genForm.handleSubmit((v) => generate.mutate(v))}
              className="space-y-4"
              autoComplete="off"
            >
              <FormField
                control={genForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={generate.isPending}>
                  {generate.isPending ? "Generating…" : "Generate"}
                </Button>
              </div>
            </form>
          </Form>

          {codes && codes.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {codes.map((c) => (
                  <Input key={c} readOnly value={c} className="font-mono" />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(codes.join("\n"));
                    toast.success("Backup codes copied");
                  }}
                >
                  Copy all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([codes.join("\n")], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "backup-codes.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download .txt
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 font-semibold">Verify backup code</h3>
          <Form {...verifyForm}>
            <form
              onSubmit={verifyForm.handleSubmit((v) => verify.mutate(v))}
              className="space-y-4"
              autoComplete="off"
            >
              <FormField
                control={verifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="xxxx-xxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={verifyForm.control}
                name="trustDevice"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                      <FormLabel>Trust this device</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={verifyForm.control}
                name="disableSession"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                      <FormLabel>Disable current session after use</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" loading={verify.isPending}>
                  {verify.isPending ? "Verifying…" : "Verify backup code"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </SurfaceCard>
  );
}

/* Disable 2FA */
export function TwoFactorDisableCard() {
  const form = useForm<TwoFactorDisableDto>({
    resolver: zodResolver(twoFactorDisableSchemaDto),
    defaultValues: { password: "" },
    mode: "onChange",
  });

  const disable = trpcClientSide.user.disableTwoFactor.useMutation({
    onSuccess: () => {
      toast.success("Two factor disabled");
      form.reset({ password: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <SurfaceCard className="w-full" animation={"none"}>
      <h2 className="mb-2 text-xl font-semibold">Disable 2FA</h2>
      <p className="text-dim-300 mb-6 text-sm font-semibold">
        Requires your password. This removes TOTP and invalidates existing
        backup codes.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => disable.mutate(v))}
          className="space-y-4"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              variant="destructive:outline"
              loading={disable.isPending}
            >
              {disable.isPending ? "Disabling…" : "Disable 2FA"}
            </Button>
          </div>
        </form>
      </Form>
    </SurfaceCard>
  );
}

/* Aggregated section (optional drop in, kept for API parity) */
export function TwoFactorSection() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <TwoFactorEnableCard />
      <TwoFactorRevealSecretCard />
      <TwoFactorVerifyTotpCard />
      <TwoFactorBackupCodesCard />
      <TwoFactorDisableCard />
    </div>
  );
}
