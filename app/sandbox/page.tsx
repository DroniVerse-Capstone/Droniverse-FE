import DronePlayground from "@/components/DronePlayground";

export default function SandboxPage() {
  return (
    <main className="min-h-svh bg-slate-950">
      <DronePlayground
        allowedModes={["sandbox"]}
        showLevelSelector={false}
        title="Sandbox Drone"
        backLink={{ href: "/", label: "Trang chủ" }}
      />
    </main>
  );
}
