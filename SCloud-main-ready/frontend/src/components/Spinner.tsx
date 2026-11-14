import clsx from "clsx";
import { LoaderCircle } from "lucide-react";

type SpinnerProps = {
  className?: string;
};

function Spinner({ className }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex">
      <LoaderCircle
        aria-hidden="true"
        className={clsx("size-5 animate-spin", className)}
      />
      <span className="sr-only">Загрузка</span>
    </span>
  );
}

export default Spinner;
