"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onExit?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class SimulatorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || "Lỗi không xác định",
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Simulator] Lỗi nghiêm trọng bị chặn:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 font-sans text-white">
          <div className="flex flex-col items-center gap-6 bg-slate-900 border border-red-500/30 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center mx-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl">
              ⚠️
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-black uppercase tracking-widest text-red-400">
                Simulator gặp sự cố
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đã xảy ra lỗi trong quá trình mô phỏng. Dữ liệu bài làm của bạn vẫn an toàn.
                Hãy thử tải lại trang.
              </p>
              {this.state.errorMessage && (
                <p className="text-[10px] font-mono text-red-400/60 bg-red-950/30 border border-red-500/20 rounded px-3 py-2 mt-2">
                  {this.state.errorMessage}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: "" });
                  window.location.reload();
                }}
                className="flex-1 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all"
              >
                🔄 Tải lại trang
              </button>
              {this.props.onExit && (
                <button
                  onClick={this.props.onExit}
                  className="flex-1 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-500/20 transition-all"
                >
                  🚪 Thoát
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
