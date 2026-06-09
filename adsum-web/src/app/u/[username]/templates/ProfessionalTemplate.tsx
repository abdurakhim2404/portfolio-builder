'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import ContactForm from '../ContactForm';

interface ProfessionalTemplateProps {
  profile: any;
  username: string;
}

interface GalleryImage {
  url: string;
  flip_horizontal?: boolean;
  flip_vertical?: boolean;
  rotation_degrees?: number;
}

export default function ProfessionalTemplate({ profile, username }: ProfessionalTemplateProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
    const withLineBreaks = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n');
    const withoutTags = withLineBreaks.replace(/<[^>]*>/g, ' ');

    if (typeof window === 'undefined') {
      return withoutTags
        .replace(/&nbsp;/gi, ' ')
        .replace(/\r/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const textarea = document.createElement('textarea');
    textarea.innerHTML = withoutTags;

    return textarea.value
      .replace(/\u00a0/g, ' ')
      .replace(/\r/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">Adsum</Link>
          <div className="flex items-center gap-6 text-sm">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" className="hover:text-slate-300 transition-colors">
                LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" className="hover:text-slate-300 transition-colors">
                GitHub
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="hover:text-slate-300 transition-colors">
                Contact
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Header Card */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-28 h-28 rounded-lg object-cover shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-3xl font-bold">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0)}
                </div>
              )}
            </motion.div>
            
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex-1"
            >
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {profile.full_name || profile.username}
              </h1>
              {profile.bio && (
                <p className="text-slate-600 leading-relaxed max-w-2xl mb-4 whitespace-pre-line">
                  {getDescriptionText(profile.bio)}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {profile.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Available for remote work
                </span>
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-8 text-center"
            >
              <div>
                <div className="text-2xl font-bold text-slate-900">{profile.projects?.length || 0}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{profile.experiences?.length || 0}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Experience</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{profile.skills?.length || 0}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Skills</div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Experience */}
            {profile.experiences?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {profile.experiences.map((exp: any, i: number) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{exp.role}</h3>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium mb-2">{exp.company}</p>
                      {exp.description && (
                        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                          {getDescriptionText(exp.description)}
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
                <h2 className="text-lg font-bold text-slate-900 mb-6">Featured Projects</h2>
                <div className="grid grid-cols-1 gap-6">
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
                      const isDescriptionExpanded = Boolean(expandedDescriptions[project.id]);
                      const descriptionText = getDescriptionText(project.description || '');
                      const canExpandDescription = descriptionText.length > 170;

                      return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm group hover:shadow-md transition-shadow ${
                        projectGallery.length > 0 ? 'cursor-zoom-in' : ''
                      }`}
                    >
                      {(project.image_url || project.images?.length > 0) && (
                        <div
                          className={`h-48 overflow-hidden bg-slate-100 ${
                            projectGallery.length > 0 ? 'cursor-zoom-in' : ''
                          }`}
                          onClick={() => openProjectGallery(projectGallery, 0)}
                        >
                          <div
                            className={`w-full h-full ${
                              isQuarterTurn(primaryRotation) ? 'flex items-center justify-center bg-slate-100' : ''
                            }`}
                          >
                            <img
                              src={project.image_url || project.images[0]?.image_url}
                              alt={project.title}
                              className={`w-full h-full transition-transform duration-500 ${
                                isQuarterTurn(primaryRotation)
                                  ? 'object-contain group-hover:scale-[1.02]'
                                  : 'object-cover group-hover:scale-105'
                              }`}
                              style={getImageTransformStyle(
                                primaryFlipHorizontal,
                                primaryFlipVertical,
                                primaryRotation,
                              )}
                            />
                          </div>
                        </div>
                      )}
                      <div className="p-6 border-t border-slate-200 bg-slate-50/60">
                        <h3 className="font-semibold text-slate-900 mb-2">{project.title}</h3>
                        {project.description && (
                          <>
                            <p
                              className={`text-sm text-slate-600 mb-2 ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}
                            >
                              {descriptionText}
                            </p>
                            {canExpandDescription && (
                              <button
                                type="button"
                                className="mb-4 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
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
                              <span key={t} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
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
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Live Demo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Source Code <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                      );
                    })()
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <section className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: any) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Card */}
            <section className="bg-slate-900 text-white rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Get in Touch</h2>
              <p className="text-slate-400 text-sm mb-4">
                Interested in working together? Send me a message.
              </p>
              <ContactForm username={username} />
            </section>
          </div>
        </div>
      </main>

      {galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeProjectGallery}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            onClick={closeProjectGallery}
          >
            <X className="w-5 h-5" />
          </button>

          {galleryImages.length > 1 && (
            <button
              type="button"
              className="absolute left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
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

          <img
            src={galleryImages[currentImageIndex]?.url}
            alt="Project screenshot"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            style={getImageTransformStyle(
              galleryImages[currentImageIndex]?.flip_horizontal,
              galleryImages[currentImageIndex]?.flip_vertical,
              galleryImages[currentImageIndex]?.rotation_degrees,
            )}
            onClick={(e) => e.stopPropagation()}
          />

          {galleryImages.length > 1 && (
            <button
              type="button"
              className="absolute right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
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
      <footer className="bg-slate-100 border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>Built with <Link href="/" className="text-slate-700 hover:text-slate-900 transition-colors">Adsum</Link></p>
        </div>
      </footer>
    </div>
  );
}
