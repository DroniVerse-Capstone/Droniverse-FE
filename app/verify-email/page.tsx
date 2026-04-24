"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/hooks/auth/useAuth";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  
  const isMounted = useRef(false);

  const { mutate: verifyEmail } = useVerifyEmail({
    onSuccess: () => {
      setStatus("success");
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.response?.data?.message || "Xác thực email thất bại!");
    }
  });

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    if (!token) {
      setStatus("error");
      setErrorMessage("Xác thực email thất bại!");
      return;
    }

    verifyEmail({ token });
  }, [token, verifyEmail]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-8 text-center text-white">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Spinner className="size-12 text-blue-500" />
            <h2 className="text-2xl font-semibold">Đang xác thực...</h2>
            <p className="text-neutral-400">Vui lòng chờ trong giây lát...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="size-16 text-green-500" />
            <h2 className="text-2xl font-semibold">Xác thực Email Thành công!</h2>
            <p className="text-neutral-400">Email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập vào tài khoản của mình.</p>
            <Button className="mt-4 w-full bg-primary hover:bg-primary/80 text-white border-none" onClick={() => router.push('/auth/login')}>
              Đăng nhập
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <XCircle className="size-16 text-red-500" />
            <h2 className="text-2xl font-semibold">Xác thực Email thất bại!</h2>
            <p className="text-red-400 bg-red-500/10 p-3 rounded-lg w-full text-sm">{errorMessage}</p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => router.push('/auth/login')}>
              Đăng nhập
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Spinner className="size-12 text-blue-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
