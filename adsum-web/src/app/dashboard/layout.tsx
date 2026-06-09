'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Briefcase, Code, Star, 
  Mail, MailOpen, LogOut, Settings, MessageSquare, 
  Globe, ChevronRight, PanelLeftClose, PanelLeft, 
  ExternalLink, Bell
} from 'lucide-react';
import api from '@/lib/axios';
import AdsumLogo from '@/components/AdsumLogo';

interface NotifMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasHydrated, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMessages, setNotifMessages] = useState<NotifMessage[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const [hasNewPulse, setHasNewPulse] = useState(false);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, isLoading, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/contact');
      const msgs: NotifMessage[] = res.data;
      const newUnread = msgs.filter(m => !m.is_read).length;
      if (newUnread > prevCountRef.current && prevCountRef.current >= 0) {
        setHasNewPulse(true);
        setTimeout(() => setHasNewPulse(false), 3000);
      }
      prevCountRef.current = newUnread;
      setNotifMessages(msgs);
    } catch (err) { console.error(err); }
    finally { setNotifLoading(false); }
  }, []);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [hasHydrated, isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifMessages.filter(m => !m.is_read).length;

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotifClick = async (msg: NotifMessage) => {
    if (!msg.is_read) {
      try {
        await api.patch(`/contact/${msg.id}/read`);
        setNotifMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch (err) { console.error(err); }
    }
    setNotifOpen(false);
    router.push('/dashboard/messages');
  };

  if (!hasHydrated) return null;

  if (!isAuthenticated && !isLoading) return null;

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Experience', href: '/dashboard/experience', icon: Code },
    { name: 'Skills', href: '/dashboard/skills', icon: Star },
    { name: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquare },
    { name: 'Messages', href: '/dashboard/messages', icon: Mail },
  ];

  const username = (user as any)?.username || '';
  const fullName = (user as any)?.full_name || username;
  const avatarUrl = (user as any)?.avatar_url || '';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen flex bg-background">
      {/* ═══ Sidebar ═══ */}
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[264px]'} bg-sidebar flex flex-col h-screen sticky top-0 shrink-0 z-20 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-5 pt-6 pb-5`}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tighter text-white">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <AdsumLogo className="w-4 h-4" />
              </div>
              Adsum
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all ${collapsed ? '' : ''}`}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto styled-scrollbar">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2 px-3">
              Menu
            </div>
          )}
          <div className="space-y-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/8'
                  }`}
                  title={collapsed ? link.name : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <link.icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="flex-1">{link.name}</span>}
                  {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                </Link>
              );
            })}
          </div>

          {/* Portfolio Link */}
          <div className={`mt-6 ${collapsed ? 'px-0' : ''}`}>
            {!collapsed && (
              <div className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2 px-3">
                Quick Links
              </div>
            )}
            <a
              href={`/u/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all`}
              title={collapsed ? 'View Portfolio' : undefined}
            >
              <Globe className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">View Portfolio</span>
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </>
              )}
            </a>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/8 space-y-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-[13px] font-medium transition-all ${
              pathname === '/dashboard/settings'
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/8'
            }`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-[18px] h-[18px]" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={() => { logout(); router.push('/'); }}
            className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* User */}
        <div className={`p-3 border-t border-white/8 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? '' : 'px-2'}`}>
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{fullName}</p>
                <p className="text-[11px] text-white/40 truncate">@{username}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-foreground capitalize">
              {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()?.replace(/-/g, ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-muted hover:text-foreground hover:shadow-soft transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ${hasNewPulse ? 'animate-bounce' : ''}`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {hasNewPulse && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500/40 animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[360px] max-h-[420px] bg-background border border-border rounded-2xl shadow-elevated overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <Link
                        href="/dashboard/messages"
                        onClick={() => setNotifOpen(false)}
                        className="text-[11px] text-muted hover:text-foreground transition-colors font-medium"
                      >
                        View all
                      </Link>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[350px] styled-scrollbar">
                      {notifLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-5 h-5 border-2 border-muted/20 border-t-foreground/40 rounded-full animate-spin" />
                        </div>
                      ) : notifMessages.length === 0 ? (
                        <div className="py-10 px-6 text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="mx-auto mb-4">
                              <motion.rect x="15" y="12" width="50" height="36" rx="6" className="fill-foreground/[0.03] stroke-border" strokeWidth="1.5"
                                initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} />
                              <motion.path d="M15 22L40 38L65 22" className="stroke-border" strokeWidth="1.5" strokeLinecap="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
                              <motion.circle cx="62" cy="14" r="6" className="fill-foreground/[0.04] stroke-border" strokeWidth="1"
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} />
                              <motion.path d="M60 14L61.5 15.5L64.5 12.5" className="stroke-foreground/20" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.3 }} />
                            </svg>
                          </motion.div>
                          <p className="text-sm font-semibold text-foreground/70 mb-1">All caught up!</p>
                          <p className="text-[11px] text-muted">No new messages from your portfolio visitors.</p>
                        </div>
                      ) : (
                        <div>
                          {notifMessages.slice(0, 8).map((msg, i) => (
                            <motion.button
                              key={msg.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() => handleNotifClick(msg)}
                              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-foreground/[0.02] transition-colors border-b border-border/50 last:border-0 ${
                                !msg.is_read ? 'bg-foreground/[0.02]' : ''
                              }`}
                            >
                              <div className="shrink-0 mt-0.5">
                                {msg.is_read
                                  ? <MailOpen className="w-4 h-4 text-muted/40" />
                                  : <Mail className="w-4 h-4 text-foreground" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className={`text-xs font-semibold truncate ${!msg.is_read ? 'text-foreground' : 'text-foreground/60'}`}>
                                    {msg.sender_name}
                                  </span>
                                  <span className="text-[10px] text-muted shrink-0">{formatTimeAgo(msg.created_at)}</span>
                                </div>
                                <p className="text-[11px] text-muted truncate">{msg.message}</p>
                              </div>
                              {!msg.is_read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <Link
              href="/dashboard/settings"
              className="w-8 h-8 rounded-lg overflow-hidden shrink-0 hover:ring-2 hover:ring-foreground/10 transition-all"
              title="Profile Settings"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[11px]">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto hide-scrollbar">
          <div className="p-8 md:p-10 max-w-6xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
