import Link from "next/link";
import { Lock, LogIn } from "@rccyx/design/icons";

import { Button } from "@rccyx/design/ui";

import { UserRoleEnum } from "@rccyx/api/rpc-models";
import { useAuth } from "~/app/hooks";

interface FormButtonsProps {
  onReset: () => void;
  isSubmitting?: boolean;
}

export function FormButtons({ onReset, isSubmitting }: FormButtonsProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  return (
    <div className="flex justify-end gap-2">
      <Button
        role="secondary"
        type="button"
        onClick={onReset}
        disabled={isSubmitting}
      >
        Cancel
      </Button>

      {!user ? (
        <Button type="button" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login to save
          </Link>
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!isAdmin || isSubmitting}
          loading={isAdmin && isSubmitting}
        >
          {isAdmin ? (
            <>{isSubmitting ? "Saving..." : "Save"}</>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Not permitted
            </>
          )}
        </Button>
      )}
    </div>
  );
}
