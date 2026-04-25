'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OdishaLogo } from '@/components/odisha-logo';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkEmailAuthorized, adminLoginAction } from './actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  // UI Logic State
  const [step, setStep] = useState<'email' | 'login'>('email');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleVerifyEmail = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    setIsLoading(true);
    setEmailError('');

    const result = await checkEmailAuthorized(email);

    if (result.authorized) {
      setIsFirstLogin(result.isFirstLogin);
      if (!result.isFirstLogin) {
        setName(result.name);
      }
      setStep('login');
      toast({ 
        title: 'Email Verified', 
        description: result.isFirstLogin ? 'Welcome! Set your administrative password.' : 'Please enter your password.' 
      });
    } else {
      setEmailError(result.error || 'Invalid Email');
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    
    if (isFirstLogin && !name) {
      toast({ title: 'Name required', description: 'Please enter your full name for the account setup.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setPasswordError('');

    const result = await adminLoginAction({
      email,
      password,
      name,
      isFirstLogin
    });

    if (result.success) {
      toast({ 
        title: 'Authenticated Successfully', 
        description: `Welcome back, ${name || email}.` 
      });
      router.push('/admin');
    } else {
      setPasswordError(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f1ed] p-4 font-body">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-block mb-2">
            <OdishaLogo className="h-16 w-16 mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tight text-[#1a1a1a]">Admin Login</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {step === 'email' ? (
            <div className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-gray-700">Name</Label>
                <Input 
                  id="name"
                  placeholder="Enter your full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-[#f9f9f6] border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-gray-700">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="example@gmail.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={`h-11 bg-[#eef4ff] border-transparent focus:ring-0 ${emailError ? 'border-red-500 bg-red-50' : ''}`}
                />
                {emailError && <p className="text-xs font-bold text-red-600 uppercase mt-1">{emailError}</p>}
              </div>

              <Button 
                onClick={handleVerifyEmail}
                className="w-full h-11 text-base font-bold bg-[#4c7c32] hover:bg-[#3d6328] transition-all shadow-md"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                {isLoading ? 'Verifying...' : 'Next'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-[#4c7c32]" />
                <div className="text-xs font-bold text-[#4c7c32] truncate flex-1">{email}</div>
                <Button variant="link" size="sm" onClick={() => setStep('email')} className="h-auto p-0 text-[10px] font-black uppercase text-muted-foreground">Change</Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-gray-700">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder=".........." 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className={`h-11 bg-[#eef4ff] border-transparent focus:ring-0 ${passwordError ? 'border-red-500 bg-red-50' : ''}`}
                  autoFocus
                />
                {passwordError && <p className="text-xs font-bold text-red-600 uppercase mt-1">{passwordError}</p>}
                {isFirstLogin && <p className="text-[10px] font-bold text-[#4c7c32] italic mt-1 leading-tight">First-time login detected. This password will be securely saved for your future access.</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-bold bg-[#4c7c32] hover:bg-[#3d6328] transition-all shadow-md"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                {isLoading ? 'Processing...' : 'Login'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <Button variant="link" asChild className="text-gray-500 hover:text-[#4c7c32] font-bold">
          <Link href="/roles">← Back to Role Selection</Link>
        </Button>
      </div>
    </div>
  );
}
