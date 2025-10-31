import { createMetadata } from "@rccyx/seo";

import { LoginPage } from "~/app/components/pages/login";

export const metadata = createMetadata({
  title: "Login",
  description: "Login to your account",
});

export default function Page() {
  return <LoginPage />;
}
