'use client';

import { CivilianSidebar } from '@/components/civilian-sidebar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, User, LogOut } from 'lucide-react';
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

function CivilianLayoutContent({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
  }, []);

  const name = searchParams.get('name') || 'Personnel';
  const role = searchParams.get('role') || 'civilian';
  const block = searchParams.get('block') || '';
  
  const formatRoleLabel = (r: string) => {
    if (r === 'driver') return 'Driver';
    if (r === 'sanitation_worker') return 'Worker';
    if (r === 'nodal_gp') return 'GP Nodal';
    if (r === 'nodal_ulb') return 'ULB Nodal';
    return 'Personnel';
  };

  const handleLogout = () => {
    router.push('/login/civilian');
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <CivilianSidebar />
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
                    <SheetTitle>Personnel Menu</SheetTitle>
                  </SheetHeader>
                  <CivilianSidebar isMobile={true} />
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
              <User className="h-9 w-9 p-1.5 rounded-full bg-muted text-muted-foreground border-2 border-primary/20"/>
              <div className="text-sm">
                <p className="font-black uppercase tracking-tight text-foreground">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="default" className="text-[7px] h-3 px-1 font-black uppercase tracking-widest">{formatRoleLabel(role)}</Badge>
                    {block && <Badge variant="secondary" className="text-[8px] py-0 font-bold">{block}</Badge>}
                </div>
              </div>
            </div>
             <Button variant="outline" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-destructive hover:text-white transition-colors">
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


export default function CivilianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CivilianLayoutContent>{children}</CivilianLayoutContent>
    </Suspense>
  );
}
