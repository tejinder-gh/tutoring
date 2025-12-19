export default function Divider({ title }: { title: string }) {
  return (
    <div className="flex items-center py-16">
      {/* Left Line */}
      <div className="flex-grow border-t border"></div>

      {/* Text Content */}
      <span className="flex-shrink mx-4 text-xl px-4 text-muted-foreground leading-relaxed uppercase tracking-wider">
        {title}
      </span>

      {/* Right Line */}
      <div className="flex-grow border-t border"></div>
    </div>
  );
}
