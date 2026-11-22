import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import NewStaffThreadModal from '../../components/staffSupport/NewStaffThreadModal';
import StaffThreadListSidebar from '../../components/staffSupport/StaffThreadListSidebar';
import StaffChatConversationPanel from '../../components/staffSupport/StaffChatConversationPanel';
import {
  fetchStaffSupportThreads,
  fetchStaffSupportThreadDetail,
  createStaffSupportThread,
  sendStaffSupportReply,
  markStaffSupportThreadAsRead
} from '../../services/staffSupportApi';

const StaffAdminChatPage = () => {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryThreadId = Number(searchParams.get('threadId')) || null;

  const [threads, setThreads] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState(queryThreadId);
  const [activeThread, setActiveThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [createError, setCreateError] = useState('');

  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const socketRef = useRef(null);

  const loadThreadList = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const res = await fetchStaffSupportThreads(
        { status: statusFilter, category: categoryFilter, search: searchTerm },
        token
      );
      if (res?.success) {
        const list = res.data ?? [];
        setThreads(list);
        setSelectedThreadId((prev) => {
          if (queryThreadId && list.some((t) => t.id === queryThreadId)) return queryThreadId;
          if (prev && list.some((t) => t.id === prev)) return prev;
          return list[0]?.id || null;
        });
      }
    } catch (err) {
      console.error('Failed to load staff support threads:', err);
    } finally {
      setLoadingList(false);
    }
  }, [token, statusFilter, categoryFilter, searchTerm, queryThreadId]);

  const loadActiveThread = useCallback(async (threadId) => {
    if (!token || !threadId) {
      setActiveThread(null);
      return;
    }
    setLoadingThread(true);
    setReplyError('');
    try {
      const res = await fetchStaffSupportThreadDetail(threadId, token);
      if (res?.success) {
        setActiveThread(res.data);
        if ((res.data?.staffUnreadCount || 0) > 0) {
          await markStaffSupportThreadAsRead(threadId, token);
          setThreads((prev) =>
            prev.map((item) => (item.id === threadId ? { ...item, staffUnreadCount: 0 } : item))
          );
        }
      }
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Unable to load conversation messages.');
    } finally {
      setLoadingThread(false);
    }
  }, [token]);

  useEffect(() => {
    loadThreadList();
  }, [loadThreadList]);

  useEffect(() => {
    if (queryThreadId && queryThreadId !== selectedThreadId) {
      setSelectedThreadId(queryThreadId);
    }
  }, [queryThreadId, selectedThreadId]);

  useEffect(() => {
    loadActiveThread(selectedThreadId);
  }, [selectedThreadId, loadActiveThread]);

  // Connect Socket.IO to receive live Admin replies and status updates
  useEffect(() => {
    if (!user?.id) return undefined;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, { auth: { user } });
    socketRef.current = socket;

    socket.emit('join_room', `user_${user.id}`);

    socket.on('staff_support_message', (payload) => {
      const incomingMsg = payload?.message;
      const updatedThread = payload?.thread;
      if (!incomingMsg) return;

      setActiveThread((prev) => {
        if (!prev || prev.id !== payload.threadId) return prev;
        const alreadyExists = (prev.messages ?? []).some((m) => m.id === incomingMsg.id);
        return {
          ...prev,
          ...(updatedThread || {}),
          messages: alreadyExists ? prev.messages : [...(prev.messages ?? []), incomingMsg]
        };
      });

      if (updatedThread) {
        setThreads((prev) => {
          const exists = prev.some((t) => t.id === updatedThread.id);
          const next = exists
            ? prev.map((t) => (t.id === updatedThread.id ? { ...t, ...updatedThread } : t))
            : [updatedThread, ...prev];
          return [...next].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        });
      }
    });

    socket.on('staff_support_reply', () => {
      loadThreadList();
    });

    socket.on('staff_support_status_updated', (payload) => {
      const updatedThread = payload?.thread;
      if (!updatedThread) return;
      setThreads((prev) => prev.map((t) => (t.id === updatedThread.id ? { ...t, ...updatedThread } : t)));
      setActiveThread((prev) => (prev && prev.id === updatedThread.id ? { ...prev, ...updatedThread } : prev));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, loadThreadList]);

  useEffect(() => {
    if (socketRef.current && selectedThreadId) {
      socketRef.current.emit('join_room', `staff_support_thread_${selectedThreadId}`);
    }
  }, [selectedThreadId]);

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
    setSearchParams({ threadId: String(threadId) });
  };

  const handleCreateNewThread = async (payload) => {
    setCreatingThread(true);
    setCreateError('');
    try {
      const res = await createStaffSupportThread(payload, token);
      if (res?.success && res.data) {
        setNewModalOpen(false);
        setThreads((prev) => [res.data, ...prev]);
        setSelectedThreadId(res.data.id);
        setActiveThread(res.data);
        setSearchParams({ threadId: String(res.data.id) });
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Unable to send your message right now.');
    } finally {
      setCreatingThread(false);
    }
  };

  const handleSendThreadReply = async (threadId, payload) => {
    setSendingReply(true);
    setReplyError('');
    try {
      const res = await sendStaffSupportReply(threadId, payload, token);
      if (res?.success && res.data?.message) {
        const newMsg = res.data.message;
        const updatedThread = res.data.thread;
        setActiveThread((prev) => {
          if (!prev || prev.id !== threadId) return prev;
          const exists = (prev.messages ?? []).some((m) => m.id === newMsg.id);
          return {
            ...prev,
            ...(updatedThread || {}),
            messages: exists ? prev.messages : [...(prev.messages ?? []), newMsg]
          };
        });
        if (updatedThread) {
          setThreads((prev) => {
            const next = prev.map((t) => (t.id === updatedThread.id ? { ...t, ...updatedThread } : t));
            return [...next].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Unable to send your reply right now.');
      return false;
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Message Admin
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Report a system issue, suggest a new feature, or chat directly with the Administrator.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateError('');
            setNewModalOpen(true);
          }}
          style={{
            padding: '0.7rem 1.35rem',
            borderRadius: 11,
            border: 'none',
            background: '#4f772d',
            color: '#ffffff',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Start New Conversation
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(290px, 360px) 1fr',
          gap: '1.25rem',
          alignItems: 'stretch'
        }}
      >
        <StaffThreadListSidebar
          isAdminView={false}
          threads={threads}
          loading={loadingList}
          selectedThreadId={selectedThreadId}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onSelectThread={handleSelectThread}
        />

        <StaffChatConversationPanel
          isAdminView={false}
          currentUserId={user?.id}
          thread={activeThread}
          loading={loadingThread}
          sending={sendingReply}
          errorMessage={replyError}
          onSendReply={handleSendThreadReply}
        />
      </div>

      <NewStaffThreadModal
        open={newModalOpen}
        submitting={creatingThread}
        serverError={createError}
        onCloseModal={() => !creatingThread && setNewModalOpen(false)}
        onCreateThread={handleCreateNewThread}
      />
    </div>
  );
};

export default StaffAdminChatPage;
