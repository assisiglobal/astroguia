export default function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-white/75">
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
