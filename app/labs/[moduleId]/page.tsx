import Link from "next/link";
import { notFound } from "next/navigation";
import { getModuleById } from "@/lib/labModules";

type ModulePageProps = {
  params: { moduleId: string };
};

export default function ModulePage({ params }: ModulePageProps) {
  const module = getModuleById(params.moduleId);
  if (!module) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-slate-950 text-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Module Lab
          </p>
          <h1 className="text-4xl font-semibold text-white">{module.title}</h1>
          <p className="text-base text-slate-300">{module.description}</p>
          {module.audience && (
            <p className="text-sm text-slate-500">{module.audience}</p>
          )}
        </div>

        <div className="mt-10 flex items-center gap-3 text-sm text-cyan-200">
          <Link href="/labs" className="hover:text-white">
            &larr; Quay lại danh sách module
          </Link>
        </div>

        <div className="mt-12 space-y-10">
          {module.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="rounded-3xl border border-white/10 bg-slate-900/40 p-6"
            >
              <div className="flex flex-col gap-2 border-b border-white/5 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-cyan-300">
                    {chapter.title}
                  </p>
                  <p className="text-sm text-slate-400">{chapter.description}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {chapter.labs.length} lab
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {chapter.labs.map((lab) => (
                  <div
                    key={lab.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-cyan-300">
                      <span>{lab.title}</span>
                      <span>{lab.estimatedMinutes} phút</span>
                    </div>
                    <p className="text-xs text-slate-400">{lab.summary}</p>
                    {lab.tags && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                        {lab.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-cyan-400/30 px-2 py-0.5 text-cyan-200/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/labs/${module.id}/${lab.id}`}
                      className="mt-auto inline-flex w-fit items-center text-sm font-semibold text-cyan-300 hover:text-cyan-100"
                    >
                      Vào lab &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

