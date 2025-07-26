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
import { useLanguage } from '@/context/language-context';

const translations = {
    English: {
      shikshaAI: 'ShikshaAI',
      dashboard: 'Dashboard',
      contentGeneration: 'Content Generation',
      worksheets: 'Worksheets',
      knowledgeBase: 'Knowledge Base',
      visualAids: 'Visual Aids',
      studentAssessment: 'Student Assessment',
      lessonPlanner: 'Lesson Planner',
      readingAssessment: 'Reading Assessment',
    },
    Hindi: {
      shikshaAI: 'शिक्षाएआई',
      dashboard: 'डैशबोर्ड',
      contentGeneration: 'सामग्री निर्माण',
      worksheets: 'कार्यपत्रक',
      knowledgeBase: 'ज्ञान कोष',
      visualAids: 'दृश्य सहायक',
      studentAssessment: 'छात्र मूल्यांकन',
      lessonPlanner: 'पाठ योजनाकार',
      readingAssessment: 'पठन मूल्यांकन',
    },
    Marathi: {
      shikshaAI: 'शिक्षाएआय',
      dashboard: 'डॅशबोर्ड',
      contentGeneration: 'सामग्री निर्मिती',
      worksheets: 'कार्यपत्रके',
      knowledgeBase: 'ज्ञान आधार',
      visualAids: 'दृश्यात्मक मदत',
      studentAssessment: 'विद्यार्थी मूल्यांकन',
      lessonPlanner: 'पाठ नियोजक',
      readingAssessment: 'वाचन मूल्यांकन',
    },
    Kashmiri: {
      shikshaAI: 'شِکشا اے آی',
      dashboard: 'ڈیش بورڈ',
      contentGeneration: 'مواد جنریشن',
      worksheets: 'ورک شیٹس',
      knowledgeBase: 'علمٕچ بنیاد',
      visualAids: 'بصری امداد',
      studentAssessment: 'طالب علمٕک تشخیص',
      lessonPlanner: 'سبق منصوبہ ساز',
      readingAssessment: 'پَرنُک تَحقیٖق',
    },
    Bengali: {
        shikshaAI: 'শিক্ষাএআই',
        dashboard: 'ড্যাশবোর্ড',
        contentGeneration: 'বিষয়বস্তু তৈরি',
        worksheets: 'ওয়ার্কশিট',
        knowledgeBase: 'জ্ঞান ভান্ডার',
        visualAids: 'ভিজ্যুয়াল এইড',
        studentAssessment: 'ছাত্র মূল্যায়ন',
        lessonPlanner: 'পাঠ পরিকল্পনাকারী',
        readingAssessment: 'পড়া মূল্যায়ন',
    },
    Tamil: {
        shikshaAI: 'ஷிக்ஷாஏஐ',
        dashboard: 'டாஷ்போர்டு',
        contentGeneration: 'உள்ளடக்க உருவாக்கம்',
        worksheets: 'பணித்தாள்கள்',
        knowledgeBase: 'அறிவுத் தளம்',
        visualAids: 'காட்சி உதவிகள்',
        studentAssessment: 'மாணவர் மதிப்பீடு',
        lessonPlanner: 'பாடம் திட்டமிடுபவர்',
        readingAssessment: 'வாசிப்பு மதிப்பீடு',
    },
    Gujarati: {
        shikshaAI: 'શિક્ષાએઆઈ',
        dashboard: 'ડેશબોર્ડ',
        contentGeneration: 'સામગ્રી નિર્માણ',
        worksheets: 'વર્કશીટ',
        knowledgeBase: 'જ્ઞાન આધાર',
        visualAids: 'વિઝ્યુઅલ એઇડ્સ',
        studentAssessment: 'વિદ્યાર્થી મૂલ્યાંકન',
        lessonPlanner: 'પાઠ યોજનાકાર',
        readingAssessment: 'વાંચન મૂલ્યાંકન',
    },
    Malayalam: {
        shikshaAI: 'ശിക്ഷാഎഐ',
        dashboard: 'ഡാഷ്ബോർഡ്',
        contentGeneration: 'ഉള്ളടക്ക നിർമ്മാണം',
        worksheets: 'വർക്ക്ഷീറ്റുകൾ',
        knowledgeBase: 'വിജ്ഞാന കേന്ദ്രം',
        visualAids: 'വിഷ്വൽ എയ്ഡുകൾ',
        studentAssessment: 'വിദ്യാർത്ഥി വിലയിരുത്തൽ',
        lessonPlanner: 'പാഠ ആസൂത്രകൻ',
        readingAssessment: 'വായന വിലയിരുത്തൽ',
    },
    Punjabi: {
        shikshaAI: 'ਸ਼ਿਕਸ਼ਾਏਆਈ',
        dashboard: 'ਡੈਸ਼ਬੋਰਡ',
        contentGeneration: 'ਸਮੱਗਰੀ ਸਿਰਜਣਾ',
        worksheets: 'ਵਰਕਸ਼ੀਟਾਂ',
        knowledgeBase: 'ਗਿਆਨ ਅਧਾਰ',
        visualAids: 'ਵਿਜ਼ੂਅਲ ਏਡਜ਼',
        studentAssessment: 'ਵਿਦਿਆਰਥੀ ਮੁਲਾਂਕਣ',
        lessonPlanner: 'ਪਾਠ ਯੋਜਨਾਕਾਰ',
        readingAssessment: 'ਪੜ੍ਹਨ ਦਾ ਮੁਲਾਂਕਣ',
    },
    Odia: {
        shikshaAI: 'ଶିକ୍ଷାଏଆଇ',
        dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
        contentGeneration: 'ବିଷୟବସ୍ତୁ ସୃଷ୍ଟି',
        worksheets: 'କାର୍ଯ୍ୟପତ୍ର',
        knowledgeBase: 'ଜ୍ଞାନ ଆଧାର',
        visualAids: 'ଭିଜୁଆଲ୍ ଏଡ୍',
        studentAssessment: 'ଛାତ୍ର ମୂଲ୍ୟାୟନ',
        lessonPlanner: 'ପାଠ ଯୋଜନାକାରୀ',
        readingAssessment: 'ପଠନ ମୂଲ୍ୟାଙ୍କନ',
    },
    Assamese: {
        shikshaAI: 'শিক্ষাএআই',
        dashboard: 'ডেশ্বৰ্ড',
        contentGeneration: 'বিষয়বস্তু সৃষ্টি',
        worksheets: 'কাৰ্যপত্ৰ',
        knowledgeBase: 'জ্ঞান ভিত্তি',
        visualAids: 'ভিজুৱেল এইড',
        studentAssessment: 'ছাত্র মূল্যায়ন',
        lessonPlanner: 'পাঠ পৰিকল্পনাকাৰী',
        readingAssessment: 'পঠন মূল্যায়ন',
    },
    Kannada: {
        shikshaAI: 'ಶಿಕ್ಷಾಎಐ',
        dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        contentGeneration: 'ವಿಷಯ ರಚನೆ',
        worksheets: 'ವರ್ಕ್‌ಶೀಟ್‌ಗಳು',
        knowledgeBase: 'ಜ್ಞಾನದ ಮೂಲ',
        visualAids: 'ದೃಶ್ಯ ಸಹಾಯಗಳು',
        studentAssessment: 'ವಿದ್ಯಾರ್ಥಿ ಮೌಲ್ಯಮಾಪನ',
        lessonPlanner: 'ಪಾಠ ಯೋಜಕ',
        readingAssessment: 'ಓದುವಿಕೆ ಮೌಲ್ಯಮಾಪನ',
    },
    Telugu: {
        shikshaAI: 'శిక్షాఏఐ',
        dashboard: 'డాష్‌బోర్డ్',
        contentGeneration: 'విషయ సృష్టి',
        worksheets: 'వర్క్‌షీట్లు',
        knowledgeBase: 'జ్ఞాన ఆధారం',
        visualAids: 'దృశ్య సహాయాలు',
        studentAssessment: 'విద్యార్థి మూల్యాంకనం',
        lessonPlanner: 'పాఠ ప్రణాళిక',
        readingAssessment: 'పఠన మూల్యాంకనం',
    },
};


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
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
