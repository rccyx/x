import Link from "next/link";
import { Lock, LogIn } from "@ashgw/design/icons";

import { Button } from "@ashgw/design/ui";

import { UserRoleEnum } from "@ashgw/api/rpc-models";
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
        variant="outline"
        type="button"
        onClick={onReset}
        disabled={isSubmitting}
      >
        Cancel
      </Button>

      {!user ? (
        <Button variant="default" type="button" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login to save
          </Link>
        </Button>
      ) : (
        <Button
          variant="default"
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
