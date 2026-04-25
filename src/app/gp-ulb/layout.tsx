'use client';

import { GpUlbSidebar } from '@/components/gp-ulb-sidebar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, User, LogOut } from 'lucide-react';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function GpUlbLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
      setMounted(true);
      setYear(new Date().getFullYear());
    }, []);
    
    const nameParam = searchParams.get('name');
    const roleParam = searchParams.get('role');
    const gpParam = searchParams.get('gp');
    const ulbParam = searchParams.get('ulb');

    let profileName = 'Official';
    let roleName = 'User';

    if (roleParam === 'ulb') {
        profileName = nameParam || 'ULB Official';
        roleName = `ULB Official (${ulbParam})`;
    } else if (roleParam === 'gp') {
        profileName = nameParam || 'GP Official';
        roleName = `GP Official (${gpParam})`;
    }

    const handleLogout = () => {
        router.push('/roles');
    };

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <GpUlbSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 lg:justify-end">
              <div className="lg:hidden">
                {mounted && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                      <SheetHeader className="sr-only">
                        <SheetTitle>GP/ULB Menu</SheetTitle>
                      </SheetHeader>
                      <GpUlbSidebar isMobile={true} />
                    </SheetContent>
                  </Sheet>
                )}
                {!mounted && (
                  <Button variant="outline" size="icon" disabled>
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-9 w-9 p-1.5 rounded-full bg-muted text-muted-foreground"/>
                  <div className="text-sm">
                    <p className="font-semibold">Welcome, {profileName.split('(')[0].trim()}</p>
                    <p className="text-muted-foreground capitalize">{roleName}</p>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
            <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
              <p>&copy; {year} Government of Odisha. All Rights Reserved.</p>
            </footer>
          </div>
        </div>
    );
}

export default function GpUlbLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <GpUlbLayoutContent>{children}</GpUlbLayoutContent>
      </Suspense>
    )
}
