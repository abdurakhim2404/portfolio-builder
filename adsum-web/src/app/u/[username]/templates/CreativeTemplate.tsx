'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Mail, Star, Briefcase, Code2, Quote, ArrowUpRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AdsumLogo from '@/components/AdsumLogo';
import Link from 'next/link';
import ContactForm from '../ContactForm';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import AnimatedSection from '@/components/AnimatedSection';
import LazyImage from '@/components/LazyImage';
import { SpotlightCard } from '@/components/SpotlightCard';

interface CreativeTemplateProps {
  profile: any;
  username: string;
}

interface GalleryImage {
  url: string;
  flip_horizontal?: boolean;
  flip_vertical?: boolean;
  rotation_degrees?: number;
}

const colorThemes: Record<string, { primary: string; gradient: string; accent: string }> = {
  blue: { primary: '#3b82f6', gradient: 'from-blue-500 to-indigo-600', accent: 'bg-blue-500' },
  emerald: { primary: '#10b981', gradient: 'from-emerald-500 to-teal-600', accent: 'bg-emerald-500' },
  purple: { primary: '#a855f7', gradient: 'from-purple-500 to-pink-600', accent: 'bg-purple-500' },
  rose: { primary: '#f43f5e', gradient: 'from-rose-500 to-orange-500', accent: 'bg-rose-500' },
  amber: { primary: '#f59e0b', gradient: 'from-amber-500 to-yellow-500', accent: 'bg-amber-500' },
};

export default function CreativeTemplate({ profile, username }: CreativeTemplateProps) {
  const theme = colorThemes[profile.theme_color] || colorThemes.blue;
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const shouldReduceMotion = useReducedMotion();
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const openProjectGallery = (images: GalleryImage[], startIndex = 0) => {
    if (images.length === 0) return;
    setGalleryImages(images);
    setCurrentImageIndex(startIndex);
  };

  const closeProjectGallery = () => {
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const getImageTransformStyle = (
    flipHorizontal?: boolean,
    flipVertical?: boolean,
    rotationDegrees = 0,
  ) => {
    const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
    const transforms: string[] = [`rotate(${normalizedRotation}deg)`];
    if (flipHorizontal) transforms.push('scaleX(-1)');
    if (flipVertical) transforms.push('scaleY(-1)');
    return transforms.length ? { transform: transforms.join(' ') } : undefined;
  };

  const isQuarterTurn = (rotationDegrees = 0) => {
    const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
    return normalizedRotation % 180 !== 0;
  };

  const getDescriptionText = (html = '') => {
    const withoutTags = html.replace(/<[^>]*>/g, ' ');

    if (typeof window === 'undefined') {
      return withoutTags.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
    }

    const textarea = document.createElement('textarea');
    textarea.innerHTML = withoutTags;

    return textarea.value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="min-h-screen bg-slate-955 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero */}
      <header className="relative min-h-[88vh] flex items-center justify-center px-6 pt-20 pb-24">
        <AnimatedSection
          direction="fade"
          duration={0.8}
          className="text-center max-w-4xl w-full"
        >
          <AnimatedSection
            direction="up"
            delay={0.2}
            className="relative w-32 h-32 mx-auto mb-10"
          >
            <div
              className="absolute -inset-2 rounded-full blur-xl opacity-70"
              style={{ backgroundColor: `${theme.primary}33` }}
            />
            {profile.avatar_url ? (
              <LazyImage
                src={profile.avatar_url}
                alt={profile.full_name}
                fallbackType="avatar"
                priority={true}
                className="relative w-32 h-32 rounded-full border-4 border-white/15 shadow-2xl"
                imgClassName="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="relative w-32 h-32 rounded-full bg-white/10 border-4 border-white/15 flex items-center justify-center text-4xl font-bold text-white/70">
                {(profile.full_name || profile.username)?.charAt(0)}
              </div>
            )}
          </AnimatedSection>
          
          <AnimatedSection
            direction="up"
            delay={0.3}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <AdsumLogo className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-sm font-medium text-white/60 uppercase tracking-widest">Portfolio</span>
          </AnimatedSection>
          
          <AnimatedSection
            direction="up"
            delay={0.4}
            className="
            "
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.2] pb-2 mb-6 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              {profile.full_name || profile.username}
            </h1>
          </AnimatedSection>
          
          {profile.bio && (
            <AnimatedSection
              direction="up"
              delay={0.5}
              className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              <div
                dangerouslySetInnerHTML={{ __html: profile.bio }}
                suppressHydrationWarning
              />
            </AnimatedSection>
          )}
          
          {/* Social Links */}
          <AnimatedSection
            direction="up"
            delay={0.6}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                GitHub <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                LinkedIn <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                Email <Mail className="w-4 h-4" />
              </a>
            )}
          </AnimatedSection>
        </AnimatedSection>
        
        {/* Scroll Indicator */}
        {!shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 rounded-full border-2 border-white/20 bg-white/[0.03] flex items-start justify-center p-2 overflow-hidden"
            >
              <motion.div
                animate={{ y: [0, 14, 0], opacity: [0.9, 0.3, 0.9] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className="w-1 h-2 bg-white/60 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </header>

      <main className="relative max-w-6xl mx-auto px-6 pb-20 space-y-32">
        {/* Projects */}
        {profile.projects?.length > 0 && (
          <section>
            <AnimatedSection
              direction="right"
              className="mb-12"
            >
              <span className="text-sm font-medium text-white/40 uppercase tracking-widest">Selected Work</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2">Projects</h2>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {profile.projects.map((project: any, i: number) => (
                (() => {
                  const coverImage: GalleryImage[] = project.image_url
                    ? [{
                        url: project.image_url,
                        flip_horizontal: project.image_flip_horizontal,
                        flip_vertical: project.image_flip_vertical,
                        rotation_degrees: project.image_rotation,
                      }]
                    : [];

                  const extraImages: GalleryImage[] = (project.images || [])
                    .map((img: any) => ({
                      url: img?.image_url,
                      flip_horizontal: img?.flip_horizontal,
                      flip_vertical: img?.flip_vertical,
                      rotation_degrees: img?.rotation_degrees,
                    }))
                    .filter((img: GalleryImage) => Boolean(img.url));

                  const projectGallery = [...coverImage, ...extraImages]
                    .filter((img: GalleryImage, index: number, arr: GalleryImage[]) =>
                      arr.findIndex((item) => item.url === img.url) === index,
                    );

                  const primaryFlipHorizontal = project.image_url
                    ? project.image_flip_horizontal
                    : project.images?.[0]?.flip_horizontal;
                  const primaryFlipVertical = project.image_url
                    ? project.image_flip_vertical
                    : project.images?.[0]?.flip_vertical;
                  const primaryRotation = project.image_url
                    ? project.image_rotation
                    : project.images?.[0]?.rotation_degrees;

                  return (
                <AnimatedSection
                  key={project.id}
                  direction="up"
                  delay={i * 0.1}
                  className="group relative"
                >
                  {(() => {
                    const isDescriptionExpanded = Boolean(expandedDescriptions[project.id]);
                    const descriptionText = getDescriptionText(project.description || '');
                    const canExpandDescription = descriptionText.length > 170;

                    return (
                  <SpotlightCard
                    spotlightColor="rgba(99, 102, 241, 0.1)"
                    className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    {/* Cover Image or Gallery */}
                    {(project.image_url || project.images?.length > 0) && (
                      <div
                        className={`h-64 overflow-hidden relative ${
                          projectGallery.length > 0 ? 'cursor-zoom-in' : ''
                        }`}
                        onClick={() => openProjectGallery(projectGallery, 0)}
                      >
                        {/* Main Cover */}
                        <div
                          className={`w-full h-full ${
                            isQuarterTurn(primaryRotation) ? 'flex items-center justify-center bg-white/5' : ''
                          }`}
                        >
                          <LazyImage
                            src={project.image_url || project.images[0]?.image_url}
                            alt={project.title}
                            fallbackType="project"
                            flipHorizontal={primaryFlipHorizontal}
                            flipVertical={primaryFlipVertical}
                            rotationDegrees={primaryRotation}
                            className="w-full h-full"
                            imgClassName={`w-full h-full transition-transform duration-700 ${
                              isQuarterTurn(primaryRotation)
                                ? 'object-contain group-hover:scale-[1.02]'
                                : 'object-cover group-hover:scale-110'
                            }`}
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                        
                        {/* Thumbnail Gallery */}
                        {project.images?.length > 1 && (
                          <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                            {project.images.slice(0, 4).map((img: any, idx: number) => (
                              <button
                                key={img.id}
                                type="button"
                                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const targetIndex = projectGallery.findIndex((item) => item.url === img.image_url);
                                  openProjectGallery(projectGallery, targetIndex === -1 ? 0 : targetIndex);
                                }}
                              >
                                <LazyImage
                                  src={img.image_url}
                                  alt=""
                                  fallbackType="project"
                                  flipHorizontal={img.flip_horizontal}
                                  flipVertical={img.flip_vertical}
                                  rotationDegrees={img.rotation_degrees}
                                  className="w-full h-full"
                                  imgClassName="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                            {project.images.length > 4 && (
                              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-xs text-white font-medium">
                                +{project.images.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6 border-t border-white/10 bg-slate-950/65">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      {project.description && (
                        <>
                          <p
                            className={`text-white/60 mb-2 ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}
                          >
                            {descriptionText}
                          </p>
                          {canExpandDescription && (
                            <button
                              type="button"
                              className="mb-4 text-xs font-semibold text-white/80 hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDescriptions((prev) => ({
                                  ...prev,
                                  [project.id]: !isDescriptionExpanded,
                                }));
                              }}
                            >
                              {isDescriptionExpanded ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </>
                      )}
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((t: string) => (
                            <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4">
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            className="text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Live Demo <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            className="text-sm font-medium text-white/40 hover:text-white transition-colors flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Source <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                    );
                  })()}
                </AnimatedSection>
                  );
                })()
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {profile.experiences?.length > 0 && (
          <section>
            <AnimatedSection
              direction="right"
              className="mb-12"
            >
              <span className="text-sm font-medium text-white/40 uppercase tracking-widest">Career</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2">Experience</h2>
            </AnimatedSection>
            
            <div className="space-y-8">
              {profile.experiences.map((exp: any, i: number) => (
                <AnimatedSection
                  key={exp.id}
                  direction="right"
                  delay={i * 0.1}
                  className="flex gap-6 group"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${theme.accent}`} />
                    <div className="w-px h-full bg-white/10 mt-2" />
                  </div>
                  <div className="pb-8">
                    <div className="flex items-baseline gap-4 mb-2">
                      <h3 className="text-xl font-bold">{exp.role}</h3>
                      <span className="text-sm text-white/40">
                        {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      </span>
                    </div>
                    <p className="text-lg text-white/60 mb-2">{exp.company}</p>
                    {exp.description && (
                      <p className="text-white/40 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} suppressHydrationWarning />
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <section>
            <AnimatedSection
              direction="right"
              className="mb-12"
            >
              <span className="text-sm font-medium text-white/40 uppercase tracking-widest">Expertise</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2">Skills</h2>
            </AnimatedSection>
            
            <div className="flex flex-wrap gap-3">
              {profile.skills.map((skill: any, i: number) => (
                <AnimatedSection
                  key={skill.id}
                  direction="fade"
                  delay={i * 0.05}
                  className={`px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all ${skill.proficiency >= 80 ? 'border-l-4' : ''}`}
                  style={skill.proficiency >= 80 ? { borderLeftColor: theme.primary } : {}}
                >
                  <span className="font-medium">{skill.name}</span>
                  {skill.proficiency && (
                    <span className="ml-2 text-sm text-white/40">{skill.proficiency}%</span>
                  )}
                </AnimatedSection>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="text-center">
          <AnimatedSection
            direction="up"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Let&apos;s Work Together</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Have a project in mind? I&apos;d love to hear about it.
            </p>
            <div className="max-w-md mx-auto">
              <ContactForm username={username} />
            </div>
          </AnimatedSection>
        </section>
      </main>

      {galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeProjectGallery}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={closeProjectGallery}
          >
            <X className="w-5 h-5" />
          </button>

          {galleryImages.length > 1 && (
            <button
              type="button"
              className="absolute left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) =>
                  prev === 0 ? galleryImages.length - 1 : prev - 1,
                );
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <LazyImage
            src={galleryImages[currentImageIndex]?.url}
            alt="Project screenshot"
            className="max-w-full max-h-[85vh]"
            imgClassName="max-w-full max-h-[85vh] object-contain rounded-xl"
            fallbackType="project"
            flipHorizontal={galleryImages[currentImageIndex]?.flip_horizontal}
            flipVertical={galleryImages[currentImageIndex]?.flip_vertical}
            rotationDegrees={galleryImages[currentImageIndex]?.rotation_degrees}
            onClick={(e) => e.stopPropagation()}
          />

          {galleryImages.length > 1 && (
            <button
              type="button"
              className="absolute right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) =>
                  prev === galleryImages.length - 1 ? 0 : prev + 1,
                );
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 text-center text-sm text-white/40">
        <p>Built with <Link href="/" className="hover:text-white transition-colors">Adsum</Link></p>
      </footer>
    </div>
  );
}
