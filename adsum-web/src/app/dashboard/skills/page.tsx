'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Loader2, Star, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import api from '@/lib/axios';
import EmptyState from '@/components/EmptyState';

interface Skill {
  id: string;
  name: string;
  proficiency: number;
  category: string;
}

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Mobile', 'Database', 'Languages', 'Tools', 'General'];

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: 'bg-blue-500/10 text-blue-600 border-blue-200',
  Backend: 'bg-violet-500/10 text-violet-600 border-violet-200',
  DevOps: 'bg-orange-500/10 text-orange-600 border-orange-200',
  Design: 'bg-pink-500/10 text-pink-600 border-pink-200',
  Mobile: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  Database: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  Languages: 'bg-amber-500/10 text-amber-600 border-amber-200',
  Tools: 'bg-slate-500/10 text-slate-600 border-slate-200',
  General: 'bg-foreground/5 text-foreground/70 border-border',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState(75);
  const [category, setCategory] = useState('General');
  const [saving, setSaving] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await api.get('/skills');
      setSkills(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/skills', { name, proficiency, category, order_index: skills.length });
      setShowModal(false);
      setName('');
      setProficiency(75);
      setCategory('General');
      fetchSkills();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const items = Array.from(skills);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    setSkills(items);

    const payload = items.map((item, index) => ({ id: item.id, order_index: index }));
    try {
      await api.patch('/skills/reorder', payload);
    } catch (err) {
      console.error(err);
      fetchSkills();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/skills/${id}`);
      fetchSkills();
    } catch (err) { console.error(err); }
  };

  const proficiencyColor = (val: number) => {
    if (val >= 90) return '#10b981';
    if (val >= 70) return '#6366f1';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
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
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Skills</h1>
          <p className="text-sm text-muted">Highlight your technical expertise.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-foreground text-surface rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
      ) : skills.length === 0 ? (
        <EmptyState
          illustration="skills"
          icon={null}
          title="No skills added"
          description="Add technologies you know to show off your expertise."
          action={
            <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-foreground text-surface rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add First Skill
            </button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="skills">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.map((skill, i) => (
                  <Draggable key={skill.id} draggableId={skill.id} index={i}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.draggableProps}
                        style={getDnDCardStyle(provided.draggableProps.style, snapshot.isDragging)}
                        className={`glass p-5 rounded-2xl group transition-[transform,box-shadow,filter] duration-200 ease-out ${
                          snapshot.isDragging
                            ? 'shadow-elevated ring-2 ring-foreground/20 brightness-[1.02]'
                            : 'hover:shadow-elevated'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className={`transition-colors text-muted/20 group-hover:text-muted -ml-1 ${
                                snapshot.isDragging
                                  ? 'cursor-grabbing text-foreground'
                                  : 'cursor-grab hover:text-foreground'
                              }`}
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground">{skill.name}</h3>
                          </div>
                          <button onClick={() => handleDelete(skill.id)}
                            className={`p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-all ${
                              snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="relative h-1.5 bg-background rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.proficiency || 0}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ backgroundColor: proficiencyColor(skill.proficiency || 0) }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.General}`}>
                            {skill.category || 'General'}
                          </span>
                          <span className="text-[11px] text-muted">{skill.proficiency || 0}%</span>
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

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-surface p-7 rounded-2xl border border-border shadow-elevated"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted" /> Add Skill
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-background transition-colors text-muted"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Skill Name *</label>
                  <input type="text" required className={inputClass} placeholder="React, Python, Docker..."
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                          category === cat
                            ? 'bg-foreground text-surface border-foreground'
                            : 'bg-background border-border text-muted hover:border-foreground/20'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">Proficiency</label>
                    <span className="text-sm font-bold text-foreground">{proficiency}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5"
                    className="w-full accent-foreground"
                    value={proficiency} onChange={e => setProficiency(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>Beginner</span><span>Expert</span>
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-3 bg-foreground text-surface rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Adding...' : 'Add Skill'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
