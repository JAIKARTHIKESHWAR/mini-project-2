import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Trash2, Clock, Plus, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatHistoryDrawer = ({ isOpen, onClose, onSelectSession, userId, currentSessionId }) => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch sessions when drawer opens
    useEffect(() => {
        if (isOpen && userId) {
            fetchSessions();
        }
    }, [isOpen, userId]);

    const fetchSessions = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/sessions/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch sessions');
            const data = await res.json();
            setSessions(data);
        } catch (err) {
            console.error('Failed to fetch chat sessions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e, sessionId) => {
        e.stopPropagation(); // Prevent selecting the session
        if (deletingId) return; // Prevent double-click

        setDeletingId(sessionId);
        try {
            const res = await fetch(`${API_URL}/api/ai/sessions/${sessionId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete session');

            // Remove from local state
            setSessions(prev => prev.filter(s => s._id !== sessionId));

            // If we deleted the currently active session, start a new chat
            if (sessionId === currentSessionId) {
                onSelectSession(null);
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Group sessions by date
    const groupSessions = (sessions) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };

        sessions.forEach(session => {
            const date = new Date(session.updatedAt);
            date.setHours(0, 0, 0, 0);

            if (date >= today) groups.today.push(session);
            else if (date >= yesterday) groups.yesterday.push(session);
            else if (date >= weekAgo) groups.thisWeek.push(session);
            else groups.older.push(session);
        });

        return groups;
    };

    const grouped = groupSessions(sessions);

    const renderGroup = (label, items) => {
        if (items.length === 0) return null;
        return (
            <div key={label} className="mb-3">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold px-2 mb-1.5"
                    style={{ color: 'rgba(251,191,36,0.45)' }}>
                    {label}
                </p>
                <div className="space-y-1">
                    {items.map(session => (
                        <motion.button
                            key={session._id}
                            onClick={() => {
                                onSelectSession(session._id);
                                onClose();
                            }}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                                ${session._id === currentSessionId
                                    ? 'bg-amber-500/15 border border-amber-500/30'
                                    : 'bg-white/[0.03] hover:bg-white/[0.07] border border-transparent hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-2.5">
                                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors
                                    ${session._id === currentSessionId ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400/60'}`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate transition-colors
                                        ${session._id === currentSessionId ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'}`}>
                                        {session.title || 'Untitled Chat'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {formatDate(session.updatedAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, session._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all shrink-0"
                                    title="Delete conversation"
                                >
                                    {deletingId === session._id ? (
                                        <span className="w-3.5 h-3.5 block border-2 border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-80 z-50 shadow-2xl flex flex-col"
                        style={{
                            background: 'linear-gradient(180deg, #0b1220 0%, #080e1a 100%)',
                            borderLeft: '1px solid rgba(251,191,36,0.08)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-4 border-b border-white/[0.06] flex items-center justify-between"
                            style={{ background: 'rgba(251,191,36,0.02)' }}>
                            <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                Chat History
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* New Chat Button — Golden */}
                        <div className="flex-shrink-0 px-3 pt-3 pb-1">
                            <button
                                onClick={() => {
                                    onSelectSession(null);
                                    onClose();
                                }}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))',
                                    border: '1px solid rgba(251,191,36,0.35)',
                                    color: 'rgb(251,191,36)',
                                    boxShadow: '0 4px 20px rgba(251,191,36,0.12)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(251,191,36,0.15))';
                                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.6)';
                                    e.currentTarget.style.boxShadow = '0 6px 28px rgba(251,191,36,0.25)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))';
                                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(251,191,36,0.12)';
                                }}
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                Start New Chat
                                <Sparkles className="w-3.5 h-3.5 opacity-60" />
                            </button>
                        </div>

                        {/* Sessions List */}
                        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(251,191,36,0.1) transparent' }}>
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                                    <p className="text-xs text-slate-500">Loading conversations...</p>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <MessageSquare className="w-8 h-8 text-slate-600" />
                                    <p className="text-sm text-slate-500">No conversations yet</p>
                                    <p className="text-xs text-slate-600 text-center px-4">
                                        Start chatting with Maestro to see your history here.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {renderGroup('Today', grouped.today)}
                                    {renderGroup('Yesterday', grouped.yesterday)}
                                    {renderGroup('This Week', grouped.thisWeek)}
                                    {renderGroup('Older', grouped.older)}
                                </>
                            )}
                        </div>

                        {/* Footer info */}
                        <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.04]">
                            <p className="text-[10px] text-slate-600 text-center tracking-wide">
                                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} · Maestro AI
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatHistoryDrawer;
