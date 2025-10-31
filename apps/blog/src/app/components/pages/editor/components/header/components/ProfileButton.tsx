import Link from "next/link";
import { User } from "@rccyx/design/icons";

import { Button } from "@rccyx/design/ui";

export function ProfileButton() {
  return (
    <Button variant="outline">
      <Link href="/profile">
        <User className="h-5 w-5" />
        <span className="sr-only">Go to profile</span>
      </Link>
    </Button>
  );
}
