'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookText,
  BrainCircuit,
  CalendarCheck,
  ImageIcon,
  LayoutDashboard,
  Layers,
  Users,
  BotMessageSquare,
  FileSignature,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { GlobalVoiceQuery } from './global-voice-query';
import { LanguageSwitcher } from './language-switcher';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/content-generation', label: 'Content Generation', icon: BookText },
  { href: '/worksheets', label: 'Worksheets', icon: Layers },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BrainCircuit },
  { href: '/visual-aids', label: 'Visual Aids', icon: ImageIcon },
  { href: '/student-assessment', label: 'Student Assessment', icon: Users },
  { href: '/lesson-planner', label: 'Lesson Planner', icon: CalendarCheck },
  { href: '/reading-assessment', label: 'Reading Assessment', icon: FileSignature },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar variant="inset" collapsible={isMobile ? 'offcanvas' : 'icon'}>
          <SidebarHeader className="items-center justify-center p-4">
            <BotMessageSquare className="h-10 w-10 text-primary" />
            <h1
              className={cn(
                'text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden'
              )}
            >
              ShikshaAI
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* Can add user profile/logout button here */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 lg:h-[60px]">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Can add breadcrumbs or page title here */}
            </div>
            <LanguageSwitcher />
          </header>
          <main className="flex-1">{children}</main>
          <GlobalVoiceQuery />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
