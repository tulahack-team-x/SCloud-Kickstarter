import clsx from "clsx";
import { Building2, FlaskConical } from "lucide-react";
import type { OrganizationType } from "../types/api";

type OrganizationIconProps = {
  type: OrganizationType;
  className?: string;
};

function OrganizationIcon({ type, className }: OrganizationIconProps) {
  const Icon = type === "SCIENTIFIC" ? FlaskConical : Building2;

  return (
    <span
      className={clsx(
        "grid shrink-0 place-items-center rounded-2xl",
        type === "SCIENTIFIC"
          ? "bg-green-100 text-green-900"
          : "bg-sky-100 text-sky-900",
        className,
      )}
    >
      <Icon className="size-1/2" aria-hidden="true" />
    </span>
  );
}

export default OrganizationIcon;
