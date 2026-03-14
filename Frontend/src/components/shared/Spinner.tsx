export const Spinner = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <div
    className={`shrink-0 rounded-full border-[1.5px] border-primary/15 border-t-primary animate-spin ${className}`}
    style={{ width: size, height: size }}
  />
);
