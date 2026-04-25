'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OdishaLogo } from '@/components/odisha-logo';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ArrowRight, UserCheck } from 'lucide-react';
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
      toast({ title: 'Email Verified', description: result.isFirstLogin ? 'Welcome! Set your account details.' : 'Please enter your password.' });
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
      toast({ title: 'Name required', description: 'Please enter your full name for the first login.', variant: 'destructive' });
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
        title: 'Authenticated', 
        description: `Welcome, ${name || email}. Accessing State Dashboard.` 
      });
      router.push('/admin');
    } else {
      setPasswordError(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4 font-body">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <OdishaLogo className="h-14 w-14 mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tight text-primary">State Admin Login</CardTitle>
          <CardDescription className="font-medium italic">Authorized personnel access only.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Official Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@odisha.gov.in" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
                  className={`h-11 font-bold border-2 ${emailError ? 'border-destructive focus:ring-destructive' : 'border-primary/10 focus:border-primary'}`}
                />
                {emailError && <p className="text-[10px] font-black text-destructive uppercase mt-1">{emailError}</p>}
              </div>
              <Button 
                onClick={handleVerifyEmail}
                className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                {isLoading ? 'Verifying...' : 'Next'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3 mb-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <div className="text-[11px] font-bold text-primary truncate max-w-[280px]">{email}</div>
                <Button variant="link" size="sm" onClick={() => setStep('email')} className="ml-auto text-[10px] font-black text-muted-foreground uppercase">Change</Button>
              </div>

              {isFirstLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Full Name</Label>
                  <Input 
                    id="name"
                    placeholder="Enter your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 font-bold border-2 border-primary/10 focus:border-primary"
                    required
                  />
                  <p className="text-[9px] font-bold text-primary italic">This name will be saved for your profile.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isFirstLogin ? 'Set New Password' : 'Login Password'}
                </Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className={`h-11 font-bold border-2 ${passwordError ? 'border-destructive focus:ring-destructive' : 'border-primary/10 focus:border-primary'}`}
                />
                {passwordError && <p className="text-[10px] font-black text-destructive uppercase mt-1">{passwordError}</p>}
                {isFirstLogin && <p className="text-[9px] font-bold text-primary italic">Enter any password to secure your account for future logins.</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                {isLoading ? 'Authenticating...' : isFirstLogin ? 'Set Up Account' : 'Enter Dashboard'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Button variant="link" asChild className="text-muted-foreground hover:text-primary font-bold">
          <Link href="/roles">← Back to Role Selection</Link>
        </Button>
      </div>
    </div>
  );
}
