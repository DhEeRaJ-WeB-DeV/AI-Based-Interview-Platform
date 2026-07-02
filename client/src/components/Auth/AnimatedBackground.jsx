function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.11),transparent_32%),linear-gradient(180deg,rgba(59,130,246,0.08),transparent_42%)]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-y-0 left-0 w-[34vw] bg-[linear-gradient(135deg,rgba(20,184,166,0.24),transparent)] opacity-50" />
      <div className="absolute inset-y-0 right-0 w-[34vw] bg-[linear-gradient(225deg,rgba(99,102,241,0.18),transparent)] opacity-50" />
    </div>
  );
}

export default AnimatedBackground;
