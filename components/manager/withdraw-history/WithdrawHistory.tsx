import React from "react";
import { MdHistory } from "react-icons/md";

export default function WithdrawHistory() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-xl border border-greyscale-700 bg-greyscale-900/50 p-12 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-greyscale-800 text-greyscale-500">
          <MdHistory size={32} />
        </div>
        <h3 className="mb-2 text-lg font-medium text-greyscale-0">Chưa có lịch sử giao dịch</h3>
        <p className="mx-auto max-w-xs text-sm text-greyscale-300">
          Khi bạn thực hiện rút tiền từ ví, các giao dịch sẽ được liệt kê tại đây để bạn dễ dàng theo dõi.
        </p>
      </div>
    </div>
  );
}
