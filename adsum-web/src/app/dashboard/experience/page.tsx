'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Briefcase, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import api from '@/lib/axios';
import RichTextEditor from '@/components/RichTextEditor';
import EmptyState from '@/components/EmptyState';

interface Experience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
}

const emptyExp = {
  company: '', role: '', start_date: '', end_date: '', is_current: false, description: '',
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [formData, setFormData] = useState(emptyExp);
  const [saving, setSaving] = useState(false);

  const fetchExperiences = useCallback(async () => {
    try { const res = await api.get('/experiences'); setExperiences(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const openCreate = () => { setEditingExp(null); setFormData({ ...emptyExp }); setShowModal(true); };

  const openEdit = (exp: Experience) => {
    setEditingExp(exp);
    setFormData({
      company: exp.company, role: exp.role,
      start_date: exp.start_date ? exp.start_date.substring(0, 10) : '',
      end_date: exp.end_date ? exp.end_date.substring(0, 10) : '',
      is_current: exp.is_current, description: exp.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...formData, end_date: formData.is_current ? null : formData.end_date || null };
    try {
      if (editingExp) { await api.patch(`/experiences/${editingExp.id}`, payload); }
      else { await api.post('/experiences', { ...payload, order_index: experiences.length }); }
      setShowModal(false); fetchExperiences();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const items = Array.from(experiences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setExperiences(items);
    try { await api.patch('/experiences/reorder', items.map((item, index) => ({ id: item.id, order_index: index }))); }
    catch (err) { console.error(err); fetchExperiences(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    try { await api.delete(`/experiences/${id}`); fetchExperiences(); } catch (err) { console.error(err); }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all font-medium placeholder:text-muted/50 text-foreground";

  const getDnDCardStyle = (style: any, isDragging: boolean) => {
    const dragTransform = style?.transform;

    return {
      ...style,
      transform: isDragging && dragTransform ? `${dragTransform} scale(1.02)` : dragTransform,
      transition: style?.transition
        ? `${style.transition}, box-shadow 160ms cubic-bezier(0.22, 1, 0.36, 1), filter 120ms ease-out`
        : 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 160ms cubic-bezier(0.22, 1, 0.36, 1)',
      zIndex: isDragging ? 60 : style?.zIndex,
    };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Experience</h1>
          <p className="text-sm text-muted">Your professional journey.</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-foreground text-surface rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
      ) : experiences.length === 0 ? (
        <EmptyState
          illustration="experience"
          icon={null}
          title="No experience added"
          description="Share your professional background to build credibility with visitors."
          action={
            <button onClick={openCreate} className="px-5 py-2.5 bg-foreground text-surface rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add First Experience
            </button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="experiences">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {experiences.map((exp, i) => (
                  <Draggable key={exp.id} draggableId={exp.id} index={i}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getDnDCardStyle(provided.draggableProps.style, snapshot.isDragging)}
                        className={`glass rounded-2xl p-5 group transition-[transform,box-shadow,filter] duration-200 ease-out ${
                          snapshot.isDragging
                            ? 'shadow-elevated ring-2 ring-foreground/20 brightness-[1.02]'
                            : 'hover:shadow-elevated'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Timeline dot */}
                          <div className="mt-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${exp.is_current ? 'bg-emerald-50 text-emerald-600' : 'bg-background text-muted'}`}>
                              <Briefcase className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-foreground">{exp.role}</h3>
                                <p className="text-sm font-medium text-muted">{exp.company}</p>
                              </div>
                              <div className={`flex items-center gap-0.5 shrink-0 ml-3 transition-opacity ${
                                snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <div
                                  {...provided.dragHandleProps}
                                  className={`p-1.5 rounded-lg hover:bg-background text-muted/30 hover:text-foreground transition-colors ${
                                    snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                  }`}
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-foreground transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-muted mt-1 mb-2">
                              {formatDate(exp.start_date)} — {exp.is_current ? <span className="text-emerald-600 font-semibold">Present</span> : formatDate(exp.end_date || '')}
                            </p>
                            {exp.description && <div className="text-sm text-muted leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: exp.description }} />}
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
                  {editingExp ? 'Edit Experience' : 'New Experience'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-background transition-colors text-muted"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Role / Position *</label>
                  <input type="text" required className={inputClass} placeholder="Frontend Developer"
                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Company *</label>
                  <input type="text" required className={inputClass} placeholder="Google, Inc."
                    value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">Start Date *</label>
                    <input type="date" required className={inputClass}
                      value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">End Date</label>
                    <input type="date" className={inputClass} disabled={formData.is_current}
                      value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded accent-foreground"
                    checked={formData.is_current} onChange={e => setFormData({ ...formData, is_current: e.target.checked })}
                  />
                  <span className="text-sm font-medium">I currently work here</span>
                </label>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Description</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full mt-2 py-3 bg-foreground text-surface rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editingExp ? 'Save Changes' : 'Add Experience'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
