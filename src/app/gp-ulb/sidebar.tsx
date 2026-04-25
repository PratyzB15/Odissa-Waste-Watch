'use client';

import {
  Home,
  Trash2,
  FileText,
  User,
  Users,
  Video,
  HomeIcon,
  Map,
  Calendar,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { OdishaLogo } from '@/components/odisha-logo';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

export function GpUlbSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gp = searchParams.get('gp');
  const ulb = searchParams.get('ulb');

  const navItems = [
    { href: '/gp-ulb', icon: Home, label: 'Dashboard' },
    { href: '/gp-ulb/waste-details', icon: Trash2, label: 'Waste Details' },
    ...(role === 'gp'
      ? [
          { href: '/gp-ulb/household-collection', icon: HomeIcon, label: 'Household Data' },
          { href: '/gp-ulb/vehicle-route', icon: Map, label: 'Vehicle Route' },
          { href: '/gp-ulb/history', icon: Calendar, label: 'Collection History' },
        ]
      : []),
    ...(role === 'ulb' ? [
        { href: '/gp-ulb/driver-details', icon: Truck, label: 'Driver & Sanitation Worker Details' },
    ] : []),
    { href: '/gp-ulb/waste-receipt-details', icon: FileText, label: 'Waste Receipt Details' },
    { href: '/gp-ulb/monthly-reporting', icon: FileText, label: 'Monthly Reporting' },
    { href: '/gp-ulb/personal-details', icon: User, label: 'Personal Details' },
  ];

  const getHref = (baseHref: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${baseHref}?${params.toString()}`;
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
        <Link href={getHref('/gp-ulb')} className="flex items-center gap-2 font-semibold">
          <OdishaLogo className="h-8 w-8" />
          <span className="text-lg font-headline">Portal</span>
        </Link>
        <Badge variant={role === 'gp' ? 'default' : 'secondary'}>{gp || ulb || role?.toUpperCase()}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start gap-1 px-2 py-4 text-sm font-medium lg:px-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={getHref(href)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                pathname === href && 'bg-muted text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
      {content}
    </aside>
  );
}
