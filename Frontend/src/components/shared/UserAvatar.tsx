export const UserAvatar = ({ initials, size = 36, variant = "primary" }: { initials?: string; size?: number; variant?: "primary" | "sapphire" }) => {
  const colorClass = variant === "sapphire" ? "text-sapphire border-sapphire/25 bg-sapphire/10" : "text-primary border-primary/25 bg-primary/10";
  return (
    <div
      className={`flex items-center justify-center font-mono font-medium tracking-wider shrink-0 ${colorClass}`}
      style={{
        width: size, height: size,
        borderRadius: size * 0.2,
        fontSize: size * 0.32,
        borderWidth: 1,
      }}
    >
      {initials?.slice(0, 2).toUpperCase()}
    </div>
  );
};
