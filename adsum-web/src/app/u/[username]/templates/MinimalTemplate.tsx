'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Mail, Star, Briefcase, Code2, Quote } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '../ContactForm';

interface MinimalTemplateProps {
  profile: any;
  username: string;
}

export default function MinimalTemplate({ profile, username }: MinimalTemplateProps) {
  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Minimal Header */}
      <header className="max-w-3xl mx-auto px-8 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
            {profile.full_name || profile.username}
          </h1>
          {profile.bio && (
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              {stripHtml(profile.bio)}
            </p>
          )}
          
          {/* Social Links */}
          <div className="flex items-center gap-6 mt-8 text-sm">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="text-slate-400 hover:text-slate-900 transition-colors">
                {profile.email}
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1">
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1">
                LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </motion.div>
      </header>

      <main className="max-w-3xl mx-auto px-8 pb-20 space-y-16">
        {/* Experience */}
        {profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">Experience</h2>
            <div className="space-y-8">
              {profile.experiences.map((exp: any, i: number) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-lg font-medium">{exp.role}</h3>
                    <span className="text-sm text-slate-400">
                      {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2">{exp.company}</p>
                  {exp.description && (
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {stripHtml(exp.description)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {profile.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">Projects</h2>
            <div className="space-y-6">
              {profile.projects.map((project: any, i: number) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group border-b border-slate-100 pb-6 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium group-hover:text-slate-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex gap-3">
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" className="text-xs text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1">
                          Live <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" className="text-xs text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1">
                          Code <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">
                      {stripHtml(project.description)}
                    </p>
                  )}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((t: string) => (
                        <span key={t} className="text-xs text-slate-400">{t}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">Skills</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {profile.skills.map((skill: any) => (
                <span key={skill.id} className="text-sm text-slate-600">
                  {skill.name}
                  {skill.proficiency && (
                    <span className="text-slate-300 ml-1">({skill.proficiency}%)</span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="pt-8 border-t border-slate-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">Get in Touch</h2>
          <div className="max-w-md">
            <ContactForm username={username} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-8 py-8 text-center text-xs text-slate-400">
        <p>Built with <Link href="/" className="hover:text-slate-600 transition-colors">Adsum</Link></p>
      </footer>
    </div>
  );
}
