import { createMetadata } from "@rccyx/seo";

import { ProfilePage } from "~/app/components/pages/profile";

export const metadata = createMetadata({
  title: "Profile",
  description: "Manage your account settings",
});

export default function Page() {
  return <ProfilePage />;
}
