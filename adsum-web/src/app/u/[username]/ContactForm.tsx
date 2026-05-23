'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';

export default function ContactForm({ username }: { username: string }) {
  const [formData, setFormData] = useState({ sender_name: '', sender_email: '', message: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft/pending messages from localStorage on mount
  useEffect(() => {
    try {
      const pending = localStorage.getItem(`adsum_contact_pending_${username}`);
      const draft = localStorage.getItem(`adsum_contact_draft_${username}`);
      const saved = pending || draft;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sender_name || parsed.sender_email || parsed.message) {
          setFormData(parsed);
          setDraftRestored(true);
        }
      }
    } catch (e) {}
  }, [username]);

  // Debounced input validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const errors: Record<string, string> = {};
      if (formData.sender_name && formData.sender_name.trim().length < 2) {
        errors.sender_name = 'Name must be at least 2 characters';
      }
      if (formData.sender_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) {
        errors.sender_email = 'Please enter a valid email address';
      }
      if (formData.message && formData.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
      }
      setValidationErrors(errors);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData]);

  // Premium asymmetric validation: immediately clear error if field becomes valid on typing
  const handleInputChange = (field: 'sender_name' | 'sender_email' | 'message', value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Persist draft immediately in case of tab closing/crash
    try {
      localStorage.setItem(`adsum_contact_draft_${username}`, JSON.stringify(updated));
    } catch (e) {}

    let isFieldValid = true;
    if (field === 'sender_name') {
      isFieldValid = value.trim().length >= 2 || value.trim().length === 0;
    } else if (field === 'sender_email') {
      isFieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || value.trim().length === 0;
    } else if (field === 'message') {
      isFieldValid = value.trim().length >= 10 || value.trim().length === 0;
    }

    if (isFieldValid) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation check
    const errors: Record<string, string> = {};
    if (!formData.sender_name.trim()) errors.sender_name = 'Name is required';
    if (!formData.sender_email.trim()) errors.sender_email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) errors.sender_email = 'Invalid email';
    if (!formData.message.trim()) errors.message = 'Message is required';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTouched({ sender_name: true, sender_email: true, message: true });
      return;
    }

    setSending(true);
    setError('');

    // Persist state to pending prior to sending to guarantee zero data loss
    try {
      localStorage.setItem(`adsum_contact_pending_${username}`, JSON.stringify(formData));
    } catch (e) {}

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/contact/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send message');

      // Success: safely clear persistence and inputs
      try {
        localStorage.removeItem(`adsum_contact_draft_${username}`);
        localStorage.removeItem(`adsum_contact_pending_${username}`);
      } catch (e) {}

      setSent(true);
      setFormData({ sender_name: '', sender_email: '', message: '' });
      setTouched({});
      setDraftRestored(false);
    } catch (err) {
      // Inputs are fully preserved in form state, allowing effortless retries
      setError('Failed to send message. Please check your network connection and click "Send Message" to try again.');
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
      {draftRestored && (
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl flex items-center justify-between">
          <span>Draft restored from your last session.</span>
          <button type="button" onClick={() => {
            try {
              localStorage.removeItem(`adsum_contact_draft_${username}`);
              localStorage.removeItem(`adsum_contact_pending_${username}`);
            } catch (e) {}
            setFormData({ sender_name: '', sender_email: '', message: '' });
            setDraftRestored(false);
          }} className="underline hover:text-white transition-colors">Clear</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/70 ml-1">Your Name *</label>
          <input
            type="text"
            required
            disabled={sending}
            className={`${inputClass} ${touched.sender_name && validationErrors.sender_name ? 'border-red-500/50 focus:ring-red-500/30' : ''} disabled:opacity-55`}
            placeholder="John Doe"
            value={formData.sender_name}
            onChange={e => handleInputChange('sender_name', e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, sender_name: true }))}
          />
          {touched.sender_name && validationErrors.sender_name && (
            <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.sender_name}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/70 ml-1">Your Email *</label>
          <input
            type="email"
            required
            disabled={sending}
            className={`${inputClass} ${touched.sender_email && validationErrors.sender_email ? 'border-red-500/50 focus:ring-red-500/30' : ''} disabled:opacity-55`}
            placeholder="john@example.com"
            value={formData.sender_email}
            onChange={e => handleInputChange('sender_email', e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, sender_email: true }))}
          />
          {touched.sender_email && validationErrors.sender_email && (
            <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.sender_email}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center ml-1">
          <label className="text-sm font-medium text-white/70">Message *</label>
          <span className={`text-xs transition-colors duration-200 ${formData.message.length > 900 ? 'text-amber-400 font-semibold' : 'text-white/40'}`}>
            {formData.message.length} / 1000
          </span>
        </div>
        <textarea
          rows={4}
          required
          maxLength={1000}
          disabled={sending}
          className={`${inputClass} resize-none ${touched.message && validationErrors.message ? 'border-red-500/50 focus:ring-red-500/30' : ''} disabled:opacity-55`}
          placeholder="Hi! I'd love to connect..."
          value={formData.message}
          onChange={e => handleInputChange('message', e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
        />
        {touched.message && validationErrors.message && (
          <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.message}</p>
        )}
      </div>

      <button type="submit" disabled={sending || Object.keys(validationErrors).length > 0}
        className="px-8 py-3 bg-[#526eff] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#4560e6] shadow-[0_0_20px_rgba(82,110,255,0.2)] transition-all disabled:opacity-50"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
