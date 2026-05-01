'use client';

import { UniversalMobileSidebar } from './universal-mobile-sidebar';
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
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>
      
      {/* Mobile Layout */}
      <div className="flex flex-1 flex-col w-full">
        {/* Mobile Header with Menu Button - Only visible on mobile */}
        <div className="lg:hidden sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center h-16 px-4">
            <UniversalMobileSidebar title={title}>
              {sidebarContent}
            </UniversalMobileSidebar>
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