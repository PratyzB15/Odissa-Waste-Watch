'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface PortalLayoutWrapperProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  title?: string;
  className?: string;
}

export function PortalLayoutWrapper({ 
  children, 
  sidebarContent, 
  title = "Navigation",
  className 
}: PortalLayoutWrapperProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => setOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const renderMobileSidebar = () => {
    if (React.isValidElement(sidebarContent)) {
      return React.cloneElement(sidebarContent as React.ReactElement<any>, { isMobile: true });
    }
    return sidebarContent;
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>
      
      {/* Mobile Layout */}
      <div className="flex flex-1 flex-col w-full">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center h-16 px-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shadow-md bg-background">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 z-[100]">
                {/* ONLY ONE CROSS BUTTON - closes sidebar when clicked */}
                <div className="flex justify-end p-4 border-b">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
                  {renderMobileSidebar()}
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex-1 text-center">
              <h1 className="text-sm font-semibold">{title}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
        
        {/* Main Content Area */}
        <main className={cn("flex-1 p-4 md:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}