'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OdishaLogo } from '@/components/odisha-logo';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Reverted to simple navigation mock
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <OdishaLogo className="h-14 w-14 mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tight">Admin Login</CardTitle>
          <CardDescription className="font-medium">Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
          <Link href="/roles">← Back to Role Selection</Link>
        </Button>
      </div>
    </div>
  );
}
