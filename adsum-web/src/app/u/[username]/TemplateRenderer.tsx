'use client';

import dynamic from 'next/dynamic';

const TemplateSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center gap-8 pt-16">
          <div className="w-28 h-28 rounded-lg bg-slate-200 dark:bg-slate-800 shimmer-placeholder dark-shimmer" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-750 rounded shimmer-placeholder dark-shimmer" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-750 rounded shimmer-placeholder dark-shimmer" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-750 rounded shimmer-placeholder dark-shimmer" />
          </div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl shimmer-placeholder dark-shimmer" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl shimmer-placeholder dark-shimmer" />
        </div>
      </div>
    </div>
  );
};

const templates: Record<string, React.ComponentType<{ profile: any; username: string }>> = {
  minimal: dynamic(() => import('./templates/MinimalTemplate'), {
    ssr: false,
    loading: () => <TemplateSkeleton />
  }),
  creative: dynamic(() => import('./templates/CreativeTemplate'), {
    ssr: false,
    loading: () => <TemplateSkeleton />
  }),
  professional: dynamic(() => import('./templates/ProfessionalTemplate'), {
    ssr: false,
    loading: () => <TemplateSkeleton />
  }),
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
