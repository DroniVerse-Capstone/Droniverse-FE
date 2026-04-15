import Loading from "@/app/loading";

export default function PlayLabLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950">
      <Loading />
    </div>
  );
}
