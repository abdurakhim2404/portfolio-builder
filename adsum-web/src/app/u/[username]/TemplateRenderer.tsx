'use client';

import dynamic from 'next/dynamic';

const templates: Record<string, React.ComponentType<{ profile: any; username: string }>> = {
  minimal: dynamic(() => import('./templates/MinimalTemplate'), { ssr: false }),
  creative: dynamic(() => import('./templates/CreativeTemplate'), { ssr: false }),
  professional: dynamic(() => import('./templates/ProfessionalTemplate'), { ssr: false }),
};

interface TemplateRendererProps {
  profile: any;
  username: string;
  templateId: string;
}

export default function TemplateRenderer({ profile, username, templateId }: TemplateRendererProps) {
  const Template = templates[templateId] || templates.creative;
  return <Template profile={profile} username={username} />;
}
