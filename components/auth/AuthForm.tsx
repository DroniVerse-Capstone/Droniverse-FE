import { LanguageSwitcher } from '@/components/layouts/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ email, password, name, confirmPassword });
  };

  return (
    <div className="col-span-7 bg-greyscale-800 bg-(image:--bg-pattern-grid)  bg-repeat bg-size-[100px_100px]">
        <div className="flex justify-between items-center p-8">
            <Button icon={<IoMdArrowBack />} variant={"outline"} onClick={() => router.push("/")}>Trang chủ</Button>
            <LanguageSwitcher />
        </div>
        
        {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-greyscale-0">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </h1>
            <p className="text-greyscale-300">
              {isLogin ? 'Để có những trải nghiệm tốt nhất' : 'Tạo tài khoản mới'}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2 bg-white hover:bg-greyscale-50">
              <FaGoogle className="text-xl" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5]">
              <FaFacebook className="text-xl" />
              Continue with Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-greyscale-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-greyscale-800 px-2 text-greyscale-400">
                HOẶC TIẾP TỤC VỚI
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-greyscale-0">
                  Họ và tên
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-greyscale-700 border-greyscale-600 text-greyscale-0"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-greyscale-0">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-greyscale-700 border-greyscale-600 text-greyscale-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-greyscale-0">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-greyscale-700 border-greyscale-600 text-greyscale-0"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-greyscale-0">
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-greyscale-700 border-greyscale-600 text-greyscale-0"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-secondary-200 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary-200 hover:bg-primary-300">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-greyscale-300">
            {isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <Link href="/auth/register" className="text-secondary-200 font-semibold hover:underline">
                  Tạo tài khoản
                </Link>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <Link href="/auth/login" className="text-secondary-200 font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
