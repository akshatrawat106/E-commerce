export const EmptyState = ({ icon, title, sub }: { icon: string; title: string; sub?: string }) => (
  <div className="text-center py-16 px-6">
    <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg">
      {icon}
    </div>
    <div className="font-body font-bold text-[17px] text-foreground mb-2">{title}</div>
    {sub && <div className="text-sm text-text-secondary leading-relaxed">{sub}</div>}
  </div>
);
