'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Quote, MessageSquare, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import api from '@/lib/axios';
import EmptyState from '@/components/EmptyState';
import ImageUpload from '@/components/ImageUpload';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  avatar_url: string;
}

const emptyTestimonial: Omit<Testimonial, 'id'> = {
  author_name: '', author_role: '', content: '', avatar_url: ''
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState(emptyTestimonial);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try { const res = await api.get('/testimonials'); setTestimonials(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const openCreate = () => { setEditingItem(null); setFormData({ ...emptyTestimonial }); setShowModal(true); };
  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({ author_name: item.author_name, author_role: item.author_role || '', content: item.content || '', avatar_url: item.avatar_url || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingItem) { await api.patch(`/testimonials/${editingItem.id}`, formData); }
      else { await api.post('/testimonials', { ...formData, order_index: testimonials.length }); }
      setShowModal(false); fetchTestimonials();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const items = Array.from(testimonials);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTestimonials(items);
    try { await api.patch('/testimonials/reorder', items.map((item, index) => ({ id: item.id, order_index: index }))); }
    catch (err) { console.error(err); fetchTestimonials(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try { await api.delete(`/testimonials/${id}`); fetchTestimonials(); } catch (err) { console.error(err); }
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
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Testimonials</h1>
          <p className="text-sm text-muted">Manage social proof and client reviews.</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-foreground text-surface rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
      ) : testimonials.length === 0 ? (
        <EmptyState
          illustration="testimonials"
          icon={null}
          title="No testimonials yet"
          description="Add reviews from clients or colleagues to build trust and credibility."
          action={
            <button onClick={openCreate} className="px-5 py-2.5 bg-foreground text-surface rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add First Testimonial
            </button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="testimonials">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {testimonials.map((item, i) => (
                  <Draggable key={item.id} draggableId={item.id} index={i}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getDnDCardStyle(provided.draggableProps.style, snapshot.isDragging)}
                        className={`glass rounded-2xl p-5 relative group transition-[transform,box-shadow,filter] duration-200 ease-out ${
                          snapshot.isDragging
                            ? 'shadow-elevated ring-2 ring-foreground/20 brightness-[1.02]'
                            : 'hover:shadow-elevated'
                        }`}
                      >
                        <Quote className="absolute top-5 right-5 w-8 h-8 text-border" />
                        
                        <div className="flex items-start gap-3 mb-3 relative z-10">
                          <div
                            {...provided.dragHandleProps}
                            className={`text-muted/20 transition-colors -ml-1 pt-1 ${
                              snapshot.isDragging
                                ? 'cursor-grabbing text-foreground'
                                : 'cursor-grab hover:text-foreground'
                            }`}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt={item.author_name} className="w-10 h-10 rounded-full object-cover border-2 border-background" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted font-bold text-sm shrink-0">
                              {item.author_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-sm text-foreground">{item.author_name}</h3>
                            <p className="text-xs text-muted">{item.author_role}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted leading-relaxed relative z-10 mb-4 italic">"{item.content}"</p>

                        <div className={`flex items-center gap-1 justify-end transition-opacity ${
                          snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-background text-muted hover:text-foreground transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
              className="w-full max-w-lg bg-surface p-7 rounded-2xl border border-border shadow-elevated"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted" />
                  {editingItem ? 'Edit Testimonial' : 'New Testimonial'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-background transition-colors text-muted"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">Author Name *</label>
                    <input type="text" required className={inputClass} placeholder="Jane Doe"
                      value={formData.author_name} onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">Role / Company</label>
                    <input type="text" className={inputClass} placeholder="CEO at TechCorp"
                      value={formData.author_role} onChange={e => setFormData({ ...formData, author_role: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Review Content *</label>
                  <textarea required rows={4} className={`${inputClass} resize-none`} placeholder="An amazing developer to work with..."
                    value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Author Avatar</label>
                  <ImageUpload 
                    value={formData.avatar_url}
                    onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                    label="Upload Avatar"
                  />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full mt-2 py-3 bg-foreground text-surface rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
