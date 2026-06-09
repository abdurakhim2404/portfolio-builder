'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle, Mail } from 'lucide-react';

export default function ContactForm({ username }: { username: string }) {
  const [formData, setFormData] = useState({ sender_name: '', sender_email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/contact/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSent(true);
      setFormData({ sender_name: '', sender_email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#526eff]/50 transition-all font-medium placeholder:text-white/25 text-white";

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">Message Sent!</h3>
        <p className="text-white/50 mb-6">Thanks for reaching out. They&apos;ll get back to you soon.</p>
        <button onClick={() => setSent(false)} className="text-sm text-[#526eff] hover:underline font-medium">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/70 ml-1">Your Name *</label>
          <input type="text" required className={inputClass} placeholder="John Doe"
            value={formData.sender_name} onChange={e => setFormData({ ...formData, sender_name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/70 ml-1">Your Email *</label>
          <input type="email" required className={inputClass} placeholder="john@example.com"
            value={formData.sender_email} onChange={e => setFormData({ ...formData, sender_email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-white/70 ml-1">Message *</label>
        <textarea rows={4} required className={`${inputClass} resize-none`} placeholder="Hi! I'd love to connect..."
          value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <button type="submit" disabled={sending}
        className="px-8 py-3 bg-[#526eff] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#4560e6] shadow-[0_0_20px_rgba(82,110,255,0.2)] transition-all disabled:opacity-50"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
