
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookText,
  BrainCircuit,
  CalendarCheck,
  Paintbrush,
  LayoutDashboard,
  Layers,
  Users,
  BotMessageSquare,
  FileSignature,
  LogOut,
  MessageCircleQuestion,
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
import { LanguageSwitcher } from './language-switcher';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const translations = {
    English: {
      shikshaAI: 'ShikshaAI',
      dashboard: 'Dashboard',
      sahayakBot: 'Sahayak Bot',
      contentGeneration: 'Content Generation',
      worksheets: 'Worksheets',
      knowledgeBase: 'Knowledge Base',
      visualAids: 'Visual Aids',
      studentAssessment: 'Student Assessment',
      lessonPlanner: 'Lesson Planner',
      readingAssessment: 'Reading Assessment',
      logout: 'Logout',
    },
    Hindi: {
      shikshaAI: 'शिक्षाएआई',
      dashboard: 'डैशबोर्ड',
      sahayakBot: 'सहायक बॉट',
      contentGeneration: 'सामग्री निर्माण',
      worksheets: 'कार्यपत्रक',
      knowledgeBase: 'ज्ञान कोष',
      visualAids: 'दृश्य सहायक',
      studentAssessment: 'छात्र मूल्यांकन',
      lessonPlanner: 'पाठ योजनाकार',
      readingAssessment: 'पठन मूल्यांकन',
      logout: 'लॉग आउट',
    },
    Marathi: {
      shikshaAI: 'शिक्षाएआय',
      dashboard: 'डॅशबोर्ड',
      sahayakBot: 'सहायक बॉट',
      contentGeneration: 'सामग्री निर्मिती',
      worksheets: 'कार्यपत्रके',
      knowledgeBase: 'ज्ञान आधार',
      visualAids: 'दृश्यात्मक मदत',
      studentAssessment: 'विद्यार्थी मूल्यांकन',
      lessonPlanner: 'पाठ नियोजक',
      readingAssessment: 'वाचन मूल्यांकन',
      logout: 'लॉग आउट',
    },
    Kashmiri: {
      shikshaAI: 'شِکشا اے آی',
      dashboard: 'ڈیش بورڈ',
      sahayakBot: 'سہایک بوٹ',
      contentGeneration: 'مواد جنریشن',
      worksheets: 'ورک شیٹس',
      knowledgeBase: 'علمٕچ بنیاد',
      visualAids: 'بصری امداد',
      studentAssessment: 'طالب علمٕک تشخیص',
      lessonPlanner: 'سبق منصوبہ ساز',
      readingAssessment: 'پَرنُک تَحقیٖق',
      logout: 'لاگ آوٹ',
    },
    Bengali: {
        shikshaAI: 'শিক্ষাএআই',
        dashboard: 'ড্যাশবোর্ড',
        sahayakBot: 'সহায়ক বট',
        contentGeneration: 'বিষয়বস্তু তৈরি',
        worksheets: 'ওয়ার্কশিট',
        knowledgeBase: 'জ্ঞান ভান্ডার',
        visualAids: 'ভিজ্যুয়াল এইড',
        studentAssessment: 'ছাত্র মূল্যায়ন',
        lessonPlanner: 'পাঠ পরিকল্পনাকারী',
        readingAssessment: 'পড়া মূল্যায়ন',
        logout: 'লগ আউট',
    },
    Tamil: {
        shikshaAI: 'ஷிக்ஷாஏஐ',
        dashboard: 'டாஷ்போர்டு',
        sahayakBot: 'சஹாயக் பாட்',
        contentGeneration: 'உள்ளடக்க உருவாக்கம்',
        worksheets: 'பணித்தாள்கள்',
        knowledgeBase: 'அறிவுத் தளம்',
        visualAids: 'காட்சி உதவிகள்',
        studentAssessment: 'மாணவர் மதிப்பீடு',
        lessonPlanner: 'பாடம் திட்டமிடுபவர்',
        readingAssessment: 'வாசிப்பு மதிப்பீடு',
        logout: 'வெளியேறு',
    },
    Gujarati: {
        shikshaAI: 'શિક્ષાએઆઈ',
        dashboard: 'ડેશબોર્ડ',
        sahayakBot: 'સહાયક બોટ',
        contentGeneration: 'સામગ્રી નિર્માણ',
        worksheets: 'વર્કશીટ',
        knowledgeBase: 'જ્ઞાન આધાર',
        visualAids: 'વિઝ્યુઅલ એઇડ્સ',
        studentAssessment: 'વિદ્યાર્થી મૂલ્યાંકન',
        lessonPlanner: 'પાઠ યોજનાકાર',
        readingAssessment: 'વાંચન મૂલ્યાંકન',
        logout: 'લૉગ આઉટ',
    },
    Malayalam: {
        shikshaAI: 'ശിക്ഷാഎഐ',
        dashboard: 'ഡാഷ്ബോർഡ്',
        sahayakBot: 'സഹായക് ബോട്ട്',
        contentGeneration: 'ഉള്ളടക്ക നിർമ്മാണം',
        worksheets: 'വർക്ക്ഷീറ്റുകൾ',
        knowledgeBase: 'വിജ്ഞാന കേന്ദ്രം',
        visualAids: 'വിഷ്വൽ എയ്ഡുകൾ',
        studentAssessment: 'വിദ്യാർത്ഥി വിലയിരുത്തൽ',
        lessonPlanner: 'പാഠ ആസൂത്രകൻ',
        readingAssessment: 'വായന വിലയിരുത്തൽ',
        logout: 'ലോഗ് ഔട്ട്',
    },
    Punjabi: {
        shikshaAI: 'ਸ਼ਿਕਸ਼ਾਏਆਈ',
        dashboard: 'ਡੈਸ਼ਬੋਰਡ',
        sahayakBot: 'ਸਹਾਇਕ ਬੋਟ',
        contentGeneration: 'ਸਮੱਗਰੀ ਸਿਰਜਣਾ',
        worksheets: 'ਵਰਕਸ਼ੀਟਾਂ',
        knowledgeBase: 'ਗਿਆਨ ਅਧਾਰ',
        visualAids: 'ਵਿਜ਼ੂਅਲ ਏਡਜ਼',
        studentAssessment: 'ਵਿਦਿਆਰਥੀ ਮੁਲਾਂਕਣ',
        lessonPlanner: 'ਪਾਠ ਯੋਜਨਾਕਾਰ',
        readingAssessment: 'ਪੜ੍ਹਨ ਦਾ ਮੁਲਾਂਕਣ',
        logout: 'ਲਾਗ ਆਊਟ',
    },
    Odia: {
        shikshaAI: 'ଶିକ୍ଷାଏଆଇ',
        dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
        sahayakBot: 'ସହାୟକ ବଟ୍',
        contentGeneration: 'ବିଷୟବସ୍ତୁ ସୃଷ୍ଟି',
        worksheets: 'କାର୍ଯ୍ୟପତ୍ର',
        knowledgeBase: 'ଜ୍ଞାନ ଆଧାର',
        visualAids: 'ଭିଜୁଆଲ୍ ଏଡ୍',
        studentAssessment: 'ଛାତ୍ର ମୂଲ୍ୟାୟନ',
        lessonPlanner: 'ପାଠ ଯୋଜନାକାରୀ',
        readingAssessment: 'ପଠନ ମୂଲ୍ୟାଙ୍କନ',
        logout: 'ଲଗ୍ ଆଉଟ୍',
    },
    Assamese: {
        shikshaAI: 'শিক্ষাএআই',
        dashboard: 'ডেশ্বৰ্ড',
        sahayakBot: 'সহায়ক বট',
        contentGeneration: 'বিষয়বস্তু সৃষ্টি',
        worksheets: 'কাৰ্যপত্ৰ',
        knowledgeBase: 'জ্ঞান ভিত্তি',
        visualAids: 'ভিজুৱেল এইড',
        studentAssessment: 'ছাত্র মূল্যায়ন',
        lessonPlanner: 'পাঠ পৰিকল্পনাকাৰী',
        readingAssessment: 'পঠন মূল্যায়ন',
        logout: 'লগ আউট',
    },
    Kannada: {
        shikshaAI: 'ಶಿಕ್ಷಾಎಐ',
        dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        sahayakBot: 'ಸಹಾಯಕ್ ಬಾಟ್',
        contentGeneration: 'ವಿಷಯ ರಚನೆ',
        worksheets: 'ವರ್ಕ್‌ಶೀಟ್‌ಗಳು',
        knowledgeBase: 'ಜ್ಞಾನದ ಮೂಲ',
        visualAids: 'ದೃಶ್ಯ ಸಹಾಯಗಳು',
        studentAssessment: 'ವಿದ್ಯಾರ್ಥಿ ಮೌಲ್ಯಮಾಪನ',
        lessonPlanner: 'ಪಾಠ ಯೋಜಕ',
        readingAssessment: 'ಓದುವಿಕೆ ಮೌಲ್ಯಮಾಪನ',
        logout: 'ಲಾಗ್ ಔಟ್',
    },
    Telugu: {
        shikshaAI: 'శిక్షాఏఐ',
        dashboard: 'డాష్‌బోర్డ్',
        sahayakBot: 'సహాయక్ బాట్',
        contentGeneration: 'విషయ సృష్టి',
        worksheets: 'వర్క్‌షీట్లు',
        knowledgeBase: 'జ్ఞాన ఆధారం',
        visualAids: 'దృశ్య సహాయాలు',
        studentAssessment: 'విద్యార్థి మూల్యాంకనం',
        lessonPlanner: 'పాఠ ప్రణాళిక',
        readingAssessment: 'పఠన మూల్యాంకనం',
        logout: 'లాగ్ అవుట్',
    },
};


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const { user, logout } = useAuth();

  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const navItems = [
    { href: '/', label: t.dashboard, icon: LayoutDashboard },
    { href: '/content-generation', label: t.contentGeneration, icon: BookText },
    { href: '/worksheets', label: t.worksheets, icon: Layers },
    { href: '/knowledge-base', label: t.knowledgeBase, icon: BrainCircuit },
    { href: '/visual-aids', label: t.visualAids, icon: Paintbrush },
    { href: '/student-assessment', label: t.studentAssessment, icon: Users },
    { href: '/lesson-planner', label: t.lessonPlanner, icon: CalendarCheck },
    { href: '/reading-assessment', label: t.readingAssessment, icon: FileSignature },
  ];

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

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
              {t.shikshaAI}
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
          <SidebarFooter className="group-data-[collapsible=icon]:hidden">
             <div className="w-full p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40.png`} />
                                <AvatarFallback>{user ? getInitials(user.name) : 'T'}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <div className="text-sm font-medium text-sidebar-foreground">{user?.name}</div>
                                <div className="text-xs text-muted-foreground">{user?.email}</div>
                            </div>
                        </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
