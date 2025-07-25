'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { StudentAssessmentClient } from './_components/student-assessment-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Student Assessment',
    description: "Track student progress, assess their improvement, and receive tailored suggestions for each student's development.",
  },
  Hindi: {
    title: 'छात्र मूल्यांकन',
    description: 'छात्र की प्रगति को ट्रैक करें, उनके सुधार का आकलन करें, और प्रत्येक छात्र के विकास के लिए अनुरूप सुझाव प्राप्त करें।',
  },
  Marathi: {
    title: 'विद्यार्थी मूल्यांकन',
    description: 'विद्यार्थ्यांच्या प्रगतीचा मागोवा घ्या, त्यांच्या सुधारणेचे मूल्यांकन करा आणि प्रत्येक विद्यार्थ्याच्या विकासासाठी तयार केलेल्या सूचना मिळवा.',
  },
  Kannada: {
    title: 'ವಿದ್ಯಾರ್ಥಿ ಮೌಲ್ಯಮಾಪನ',
    description: 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಅವರ ಸುಧಾರಣೆಯನ್ನು ನಿರ್ಣಯಿಸಿ, ಮತ್ತು ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿಯ ಅಭಿವೃದ್ಧಿಗೆ ಅನುಗುಣವಾಗಿ ಸಲಹೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ.',
  },
  Telugu: {
    title: 'విద్యార్థి మూల్యాంకనం',
    description: 'విద్యార్థి పురోగతిని ట్రాక్ చేయండి, వారి మెరుగుదలని అంచనా వేయండి మరియు ప్రతి విద్యార్థి అభివృద్ధికి అనుగుణంగా సూచనలను స్వీకరించండి.',
  },
};

export default function StudentAssessmentPage() {
    const { language } = useLanguage();
    const typedLanguage = language as keyof typeof pageTranslations;
    const pageTranslation = pageTranslations[typedLanguage] || pageTranslations['English'];

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title={pageTranslation.title}
          description={pageTranslation.description}
        />
        <StudentAssessmentClient />
      </div>
    </AppShell>
  );
}