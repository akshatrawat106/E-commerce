export const AmbientOrbs = ({ intensity = 0.06 }: { intensity?: number }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {[
      { color: "var(--primary)", top: "20%", left: "10%", dur: "18s", delay: "0s" },
      { color: "var(--sapphire)", top: "60%", left: "70%", dur: "22s", delay: "-4s" },
      { color: "var(--emerald)", top: "40%", left: "40%", dur: "15s", delay: "-8s" },
    ].map((orb, i) => (
      <div
        key={i}
        className="absolute w-[40vw] h-[40vw] rounded-full blur-[40px]"
        style={{
          background: `radial-gradient(circle, hsl(${orb.color} / ${intensity}) 0%, transparent 70%)`,
          top: orb.top, left: orb.left,
          transform: "translate(-50%, -50%)",
          animation: `orbFloat ${orb.dur} ease-in-out infinite`,
          animationDelay: orb.delay,
        }}
      />
    ))}
  </div>
);

export const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <div
    className="absolute inset-0 pointer-events-none z-0"
    style={{
      backgroundImage: `linear-gradient(hsl(var(--primary) / ${opacity}) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / ${opacity}) 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
    }}
  />
);

export const GoldDivider = () => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
    <div className="w-1 h-1 rounded-[1px] bg-primary-dim rotate-45" />
    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
  </div>
);
