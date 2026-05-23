'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ExternalLink, X, Loader2, Briefcase, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import api from '@/lib/axios';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import EmptyState from '@/components/EmptyState';
import ProjectGallery from '@/components/ProjectGallery';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_flip_horizontal: boolean;
  image_flip_vertical: boolean;
  image_rotation: number;
  live_url: string;
  github_url: string;
  technologies: string[];
  images?: {
    id: string;
    image_url: string;
    order_index: number;
    flip_horizontal?: boolean;
    flip_vertical?: boolean;
    rotation_degrees?: number;
  }[];
}

const emptyProject: Omit<Project, 'id'> = {
  title: '',
  description: '',
  image_url: '',
  image_flip_horizontal: false,
  image_flip_vertical: false,
  image_rotation: 0,
  live_url: '',
  github_url: '',
  technologies: [],
};

const getProjectPreviewText = (html: string) => {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');

  if (typeof window === 'undefined') {
    return withoutTags
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = withoutTags;

  return textarea.value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => {
    setEditingProject(null);
    setFormData({ ...emptyProject });
    setTechInput('');
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title, description: project.description || '',
      image_flip_horizontal: project.image_flip_horizontal || false,
      image_flip_vertical: project.image_flip_vertical || false,
      image_rotation: project.image_rotation || 0,
      image_url: project.image_url || '', live_url: project.live_url || '',
      github_url: project.github_url || '', technologies: project.technologies || [],
    });
    setTechInput('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProject) {
        await api.patch(`/projects/${editingProject.id}`, formData);
        setShowModal(false);
      } else {
        const { data: createdProject } = await api.post('/projects', {
          ...formData,
          order_index: projects.length,
        });
        setEditingProject(createdProject);
      }
      await fetchProjects();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setProjects(items);
    try {
      await api.patch('/projects/reorder', items.map((item, index) => ({ id: item.id, order_index: index })));
    } catch (err) { console.error(err); fetchProjects(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try { await api.delete(`/projects/${id}`); fetchProjects(); } catch (err) { console.error(err); }
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !formData.technologies.includes(t)) {
      setFormData({ ...formData, technologies: [...formData.technologies, t] });
    }
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setFormData({ ...formData, technologies: formData.technologies.filter(t => t !== tech) });
  };

  const activeEditingProject = editingProject
    ? projects.find((project) => project.id === editingProject.id) || editingProject
    : null;

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all font-medium placeholder:text-muted/50 text-foreground";

  const getImageTransformStyle = (flipHorizontal?: boolean, flipVertical?: boolean) => {
    const transforms: string[] = [];
    transforms.push(`rotate(${formData.image_rotation}deg)`);
    if (flipHorizontal) transforms.push('scaleX(-1)');
    if (flipVertical) transforms.push('scaleY(-1)');
    return transforms.length ? { transform: transforms.join(' ') } : undefined;
  };

  const normalizeRotation = (rotation = 0) => ((rotation % 360) + 360) % 360;

  const isQuarterTurn = (rotation = 0) => normalizeRotation(rotation) % 180 !== 0;

  const getCardImageTransformStyle = (
    flipHorizontal?: boolean,
    flipVertical?: boolean,
    rotation = 0,
  ) => {
    const transforms: string[] = [`rotate(${normalizeRotation(rotation)}deg)`];
    if (flipHorizontal) transforms.push('scaleX(-1)');
    if (flipVertical) transforms.push('scaleY(-1)');
    return { transform: transforms.join(' '), transformOrigin: 'center' as const };
  };

  const getDnDCardStyle = (style: any, isDragging: boolean) => {
    const dragTransform = style?.transform;

    return {
      ...style,
      transform: isDragging && dragTransform ? `${dragTransform} scale(1.02)` : dragTransform,
      transition: style?.transition,
      zIndex: isDragging ? 60 : style?.zIndex,
    };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Projects</h1>
          <p className="text-sm text-muted">Showcase your best work.</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-foreground text-surface rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          illustration="projects"
          icon={null}
          title="No projects yet"
          description="Add your first project to showcase your skills and work."
          action={
            <button onClick={openCreate} className="px-5 py-2.5 bg-foreground text-surface rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Create First Project
            </button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, i) => (
                  <Draggable key={project.id} draggableId={project.id} index={i}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.draggableProps}
                        style={getDnDCardStyle(provided.draggableProps.style, snapshot.isDragging)}
                        className={`glass rounded-2xl overflow-hidden group transition-[box-shadow,filter,background-color,border-color] duration-200 ease-out ${
                          snapshot.isDragging
                            ? 'shadow-elevated ring-2 ring-foreground/20 brightness-[1.02]'
                            : 'hover:shadow-elevated'
                        }`}
                      >
                        {project.image_url && (
                          <div className="h-36 overflow-hidden bg-background relative">
                            <div
                              className={`w-full h-full ${
                                isQuarterTurn(project.image_rotation)
                                  ? 'flex items-center justify-center bg-background'
                                  : ''
                              }`}
                            >
                              <img
                                src={project.image_url}
                                alt={project.title}
                                className={`w-full h-full transition-transform duration-500 ${
                                  isQuarterTurn(project.image_rotation)
                                    ? 'object-contain group-hover:scale-[1.02]'
                                    : 'object-cover group-hover:scale-105'
                                }`}
                                style={getCardImageTransformStyle(
                                  project.image_flip_horizontal,
                                  project.image_flip_vertical,
                                  project.image_rotation,
                                )}
                              />
                            </div>
                            <div
                              {...provided.dragHandleProps}
                              className={`absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur text-foreground rounded-lg transition-colors shadow-soft ${
                                snapshot.isDragging
                                  ? 'cursor-grabbing bg-white shadow-elevated'
                                  : 'cursor-grab hover:bg-white'
                              }`}
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {!project.image_url && (
                                <div
                                  {...provided.dragHandleProps}
                                  className={`text-muted/20 transition-colors -ml-1 ${
                                    snapshot.isDragging
                                      ? 'cursor-grabbing text-foreground'
                                      : 'cursor-grab hover:text-foreground'
                                  }`}
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              )}
                              <h3 className="font-bold text-foreground">{project.title}</h3>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0 ml-3">
                              <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-foreground transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-xs text-muted mb-3 line-clamp-2">
                              {getProjectPreviewText(project.description)}
                            </p>
                          )}
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.map(t => (
                                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border text-muted font-medium">{t}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-3 pt-1">
                            {project.live_url && (
                              <a href={project.live_url} target="_blank" className="text-[11px] text-muted hover:text-foreground flex items-center gap-1 transition-colors font-medium">
                                <ExternalLink className="w-3 h-3" /> Live
                              </a>
                            )}
                            {project.github_url && (
                              <a href={project.github_url} target="_blank" className="text-[11px] text-muted hover:text-foreground flex items-center gap-1 transition-colors font-medium">
                                <ExternalLink className="w-3 h-3" /> GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-surface p-7 rounded-2xl border border-border shadow-elevated max-h-[90vh] overflow-y-auto styled-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted" />
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-background transition-colors text-muted"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Title *</label>
                  <input type="text" required className={inputClass} placeholder="My Awesome Project"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Description</label>
                  <RichTextEditor 
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="What does this project do?"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Cover Image</label>
                  <ImageUpload 
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    label="Upload Project Cover"
                    previewStyle={getImageTransformStyle(
                      formData.image_flip_horizontal,
                      formData.image_flip_vertical,
                    )}
                  />
                  {formData.image_url && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          image_flip_horizontal: !formData.image_flip_horizontal,
                        })}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          formData.image_flip_horizontal
                            ? 'border-foreground bg-foreground text-surface'
                            : 'border-border bg-background text-foreground hover:bg-surface-raised'
                        }`}
                      >
                        Flip Horizontal
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          image_flip_vertical: !formData.image_flip_vertical,
                        })}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          formData.image_flip_vertical
                            ? 'border-foreground bg-foreground text-surface'
                            : 'border-border bg-background text-foreground hover:bg-surface-raised'
                        }`}
                      >
                        Flip Vertical
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          image_rotation: (formData.image_rotation - 90 + 360) % 360,
                        })}
                        className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-surface-raised transition-colors"
                      >
                        Rotate Left
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          image_rotation: (formData.image_rotation + 90) % 360,
                        })}
                        className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-surface-raised transition-colors"
                      >
                        Rotate Right
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">Live URL</label>
                    <input type="url" className={inputClass} placeholder="https://..."
                      value={formData.live_url} onChange={e => setFormData({ ...formData, live_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">GitHub URL</label>
                    <input type="url" className={inputClass} placeholder="https://github.com/..."
                      value={formData.github_url} onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Technologies</label>
                  <div className="flex gap-2">
                    <input type="text" className={inputClass} placeholder="React, Node.js..."
                      value={techInput} onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                    />
                    <button type="button" onClick={addTech} className="px-4 bg-background border border-border rounded-xl text-sm font-medium hover:bg-surface-raised transition-colors shrink-0">Add</button>
                  </div>
                  {formData.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.technologies.map(t => (
                        <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-border text-foreground font-medium flex items-center gap-1">
                          {t}
                          <button type="button" onClick={() => removeTech(t)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {activeEditingProject && (
                  <ProjectGallery
                    projectId={activeEditingProject.id}
                    images={activeEditingProject.images || []}
                    onUpdate={() => {
                      void fetchProjects();
                    }}
                  />
                )}

                {!activeEditingProject && (
                  <p className="text-xs text-muted">
                    Additional screenshots (up to 5) become available right after you create the project.
                  </p>
                )}

                <button type="submit" disabled={saving}
                  className="w-full mt-2 py-3 bg-foreground text-surface rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
