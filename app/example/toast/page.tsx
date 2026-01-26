"use client";

import toast from "react-hot-toast";
import Link from "next/link";

export default function ToastDemoPage() {
  const showSuccessToast = () => {
    toast.success("This is a success message!");
  };

  const showErrorToast = () => {
    toast.error("This is an error message!");
  };

  const showInfoToast = () => {
    toast("This is an info message!", {
      icon: "ℹ️",
    });
  };

  const showWarningToast = () => {
    toast("This is a warning message!", {
      icon: "⚠️",
      style: {
        background: "#f59e0b",
        color: "#ffffff",
      },
    });
  };

  const showLoadingToast = () => {
    const toastId = toast.loading("Loading...");
    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success("Done!");
    }, 2000);
  };

  const showPromiseToast = () => {
    const myPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("Success!") : reject("Failed!");
      }, 2000);
    });

    toast.promise(myPromise, {
      loading: "Processing...",
      success: "Operation completed!",
      error: "Operation failed!",
    });
  };

  const showCustomToast = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">Custom Toast</p>
              <p className="mt-1 text-sm text-white/80">
                This is a fully customized toast notification!
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-white/20">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 transition"
          >
            Close
          </button>
        </div>
      </div>
    ));
  };

  const showMultipleToasts = () => {
    toast.success("First notification");
    setTimeout(() => toast.error("Second notification"), 500);
    setTimeout(() => toast("Third notification", { icon: "🔔" }), 1000);
  };

  const dismissAllToasts = () => {
    toast.dismiss();
    toast("All toasts dismissed!", { icon: "🧹" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold tracking-wide text-primary">
            Toast Demo
          </h1>
          <Link
            href="/"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 text-primary">
            React Hot Toast Demo
          </h2>
          <p className="text-slate-400 text-lg">
            Click the buttons below to see different types of toast notifications
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Toasts */}
          <section>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Basic Toasts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={showSuccessToast}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">✓</span>
                Success Toast
              </button>

              <button
                onClick={showErrorToast}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">✗</span>
                Error Toast
              </button>

              <button
                onClick={showInfoToast}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">ℹ</span>
                Info Toast
              </button>

              <button
                onClick={showWarningToast}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">⚠</span>
                Warning Toast
              </button>

              <button
                onClick={showLoadingToast}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">⌛</span>
                Loading Toast
              </button>

              <button
                onClick={showPromiseToast}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">🔄</span>
                Promise Toast
              </button>
            </div>
          </section>

          {/* Advanced Toasts */}
          <section>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Advanced Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={showCustomToast}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">🎨</span>
                Custom Toast
              </button>

              <button
                onClick={showMultipleToasts}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">🔢</span>
                Multiple Toasts
              </button>

              <button
                onClick={dismissAllToasts}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-2xl mb-2 block">🧹</span>
                Dismiss All
              </button>
            </div>
          </section>

          {/* Code Examples */}
          <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Usage Examples
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400 mb-2">Success:</p>
                <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-green-400 overflow-x-auto">
                  toast.success("Success message!");
                </pre>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Error:</p>
                <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-red-400 overflow-x-auto">
                  toast.error("Error message!");
                </pre>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Promise:</p>
                <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-cyan-400 overflow-x-auto">
                  {`toast.promise(promise, {
  loading: "Loading...",
  success: "Success!",
  error: "Failed!",
});`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
