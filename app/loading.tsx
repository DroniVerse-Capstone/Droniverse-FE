"use client";
export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="relative w-32 h-32 flex flex-col items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-radar" />

        <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin"></div>

        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin-slow"></div>

        <div className="absolute w-5 h-5 bg-cyan-300 rounded-full animate-droneOrbit"></div>

        <div className="absolute w-4 h-4 bg-blue-400 rounded-full animate-droneOrbit delay-200"></div>

        <div className="absolute w-3 h-3 bg-purple-400 rounded-full animate-droneOrbit delay-400"></div>

        <p className="mt-40 text-slate-400 text-sm animate-pulse">
          Khởi tạo Drone<span className="animate-ping">...</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes droneOrbit {
          0% {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
          }
        }

        .animate-droneOrbit {
          animation: droneOrbit 4s linear infinite;
        }

        @keyframes radar {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .animate-radar {
          animation: radar 2s linear infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
