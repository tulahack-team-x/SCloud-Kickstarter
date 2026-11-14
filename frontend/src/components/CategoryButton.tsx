import clsx from "clsx";

type CategoryButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function CategoryButton({ label, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={clsx(
        "rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-ring",
        isActive
          ? "border-green-800 bg-green-800 text-white"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100 hover:text-stone-950",
      )}
    >
      {label}
    </button>
  );
}

export default CategoryButton;
