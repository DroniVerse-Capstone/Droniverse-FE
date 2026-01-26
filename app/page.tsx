import Link from "next/link";
//

export default function HomePage() {
  return (
    <div className="min-h-svh bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-wide text-cyan-300"
          >
            DroneLab Academy
          </Link>
          <nav className="flex items-center gap-4 text-sm  text-slate-300">
            <Link href="/sandbox" className="hover:text-white transition">
              Sandbox
            </Link>
            <Link href="/labs" className="hover:text-white transition">
              Module Lab
            </Link>
            <Link href="/map-editor" className="hover:text-white transition">
              Map Editor
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
