import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-green-800 text-white hover:bg-green-900",
  secondary:
    "border border-stone-300 bg-white text-stone-900 hover:bg-stone-100",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
  compact?: boolean;
};

function Button({
  variant = "primary",
  asChild = false,
  compact = false,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={clsx(
        "group inline-flex items-center gap-2 rounded-lg text-sm font-bold transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50",
        compact ? "px-3 py-2" : "px-5 py-3",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export default Button;
