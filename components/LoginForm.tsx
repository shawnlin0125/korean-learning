'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// shadcn/ui 風格的 Input — 專案中沒有 components/ui/input.tsx，故在此直接定義
function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export default function LoginForm() {
  const { login, register } = useAuth();

  // 登入表單
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // 註冊表單
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      // AuthContext 自動更新 user 狀態，無需 redirect
    } catch (err: any) {
      setLoginError(err?.message || '登入失敗，請稍後再試');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    // 基本驗證
    if (!regEmail.includes('@')) {
      setRegError('請輸入有效的電子郵件地址');
      setRegLoading(false);
      return;
    }
    if (regPassword.length < 8) {
      setRegError('密碼長度至少需要 8 個字元');
      setRegLoading(false);
      return;
    }
    if (!regUsername.trim()) {
      setRegError('請輸入使用者名稱');
      setRegLoading(false);
      return;
    }

    try {
      await register({ email: regEmail, username: regUsername.trim(), password: regPassword });
      // AuthContext 自動更新 user 狀態
    } catch (err: any) {
      setRegError(err?.message || '註冊失敗，請稍後再試');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>歡迎來到韓文學習平台 🇰🇷</CardTitle>
        <CardDescription>登入以儲存您的學習進度，或建立新帳號開始學習</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList variant="default" className="w-full mb-6">
            <TabsTrigger value="login">登入</TabsTrigger>
            <TabsTrigger value="register">註冊</TabsTrigger>
          </TabsList>

          {/* 登入表單 */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {loginError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {loginError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className="text-sm font-medium">
                  電子郵件
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="login-password" className="text-sm font-medium">
                  密碼
                </label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? '登入中…' : '登入'}
              </Button>
            </form>
          </TabsContent>

          {/* 註冊表單 */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {regError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {regError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-email" className="text-sm font-medium">
                  電子郵件
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-username" className="text-sm font-medium">
                  使用者名稱
                </label>
                <Input
                  id="reg-username"
                  type="text"
                  placeholder="您的暱稱"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-password" className="text-sm font-medium">
                  密碼
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="至少 8 個字元"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={regLoading}>
                {regLoading ? '註冊中…' : '建立帳號'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground w-full text-center">
          登入即表示您同意我們的服務條款與隱私政策
        </p>
      </CardFooter>
    </Card>
  );
}
