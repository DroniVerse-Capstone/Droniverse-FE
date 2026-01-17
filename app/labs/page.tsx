import Link from "next/link";
import { LAB_MODULES } from "@/lib/labModules";

export default function LabsLandingPage() {
  return (
    <main className="min-h-svh bg-slate-950 text-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Module Lab
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Chọn module, mở chapter, bắt đầu lab
          </h1>
          <p className="text-base text-slate-300">
            Mỗi module gom các lab cùng chủ đề. Bạn có thể duyệt nội dung tổng quan,
            xem chương và nhảy ngay vào lab bất kỳ.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {LAB_MODULES.map((module) => (
            <Link
              key={module.id}
              href={`/labs/${module.id}`}
              className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-6 transition hover:border-cyan-400/50"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-cyan-300">
                <span>{module.title}</span>
                <span>{module.chapters.length} chương</span>
              </div>
              <p className="text-sm text-slate-300">{module.description}</p>
              {module.audience && (
                <p className="text-xs text-slate-500">{module.audience}</p>
              )}
              <div className="text-sm font-semibold text-cyan-300 group-hover:text-cyan-100">
                Xem chi tiết &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

