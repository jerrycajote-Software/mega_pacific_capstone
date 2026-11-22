import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import StaffThreadListSidebar from '../../components/staffSupport/StaffThreadListSidebar';
import StaffChatConversationPanel from '../../components/staffSupport/StaffChatConversationPanel';
import {
  fetchStaffSupportThreads,
  fetchStaffSupportThreadDetail,
  sendStaffSupportReply,
  markStaffSupportThreadAsRead,
  updateStaffSupportThreadStatus
} from '../../services/staffSupportApi';

const StaffMessagesPage = () => {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryThreadId = Number(searchParams.get('threadId')) || null;

  const [threads, setThreads] = useState([]);
  const [summary, setSummary] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    systemProblems: 0,
    featureRequests: 0,
    unreadMessages: 0
  });
  const [loadingList, setLoadingList] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState(queryThreadId);
  const [activeThread, setActiveThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [chatError, setChatError] = useState('');
  const socketRef = useRef(null);

  const loadAdminThreads = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const res = await fetchStaffSupportThreads(
        {
          status: statusFilter,
          category: categoryFilter,
          department: departmentFilter,
          search: searchTerm
        },
        token
      );
      if (res?.success) {
        const list = res.data ?? [];
        setThreads(list);
        if (res.summary) setSummary(res.summary);
        setSelectedThreadId((prev) => {
          if (queryThreadId && list.some((t) => t.id === queryThreadId)) return queryThreadId;
          if (prev && list.some((t) => t.id === prev)) return prev;
          return list[0]?.id || null;
        });
      }
    } catch (err) {
      console.error('Failed to load Admin staff messages:', err);
    } finally {
      setLoadingList(false);
    }
  }, [token, statusFilter, categoryFilter, departmentFilter, searchTerm, queryThreadId]);

  const loadSelectedThread = useCallback(async (threadId) => {
    if (!token || !threadId) {
      setActiveThread(null);
      return;
    }
    setLoadingThread(true);
    setChatError('');
    try {
      const res = await fetchStaffSupportThreadDetail(threadId, token);
      if (res?.success) {
        setActiveThread(res.data);
        if ((res.data?.adminUnreadCount || 0) > 0) {
          await markStaffSupportThreadAsRead(threadId, token);
          setThreads((prev) =>
            prev.map((item) => (item.id === threadId ? { ...item, adminUnreadCount: 0 } : item))
          );
        }
      }
    } catch (err) {
      setChatError(err.response?.data?.message || 'Unable to load conversation messages.');
    } finally {
      setLoadingThread(false);
    }
  }, [token]);

  useEffect(() => {
    loadAdminThreads();
  }, [loadAdminThreads]);

  useEffect(() => {
    if (queryThreadId && queryThreadId !== selectedThreadId) {
      setSelectedThreadId(queryThreadId);
    }
  }, [queryThreadId, selectedThreadId]);

  useEffect(() => {
    loadSelectedThread(selectedThreadId);
  }, [selectedThreadId, loadSelectedThread]);

  // Listen to live staff support events inside the Admin room
  useEffect(() => {
    if (!user?.id) return undefined;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, { auth: { user } });
    socketRef.current = socket;

    socket.emit('join_room', 'admin');

    socket.on('admin_staff_support_created', () => {
      loadAdminThreads();
    });

    socket.on('admin_staff_support_updated', () => {
      loadAdminThreads();
    });

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
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, loadAdminThreads]);

  useEffect(() => {
    if (socketRef.current && selectedThreadId) {
      socketRef.current.emit('join_room', `staff_support_thread_${selectedThreadId}`);
    }
  }, [selectedThreadId]);

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
    setSearchParams({ threadId: String(threadId) });
  };

  const handleSendAdminReply = async (threadId, payload) => {
    setSendingReply(true);
    setChatError('');
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
        loadAdminThreads();
        return true;
      }
      return false;
    } catch (err) {
      setChatError(err.response?.data?.message || 'Unable to send your reply right now.');
      return false;
    } finally {
      setSendingReply(false);
    }
  };

  const handleChangeThreadStatus = async (threadId, nextStatus) => {
    setUpdatingStatus(true);
    setChatError('');
    try {
      const res = await updateStaffSupportThreadStatus(threadId, nextStatus, token);
      if (res?.success && res.data) {
        setActiveThread((prev) => (prev && prev.id === threadId ? { ...prev, ...res.data } : prev));
        loadAdminThreads();
      }
    } catch (err) {
      setChatError(err.response?.data?.message || 'Unable to update conversation status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const kpiCards = [
    { label: 'Open Conversations', value: summary.open + summary.inProgress, color: '#f59e0b' },
    { label: 'Active System Problems', value: summary.systemProblems, color: '#ef4444' },
    { label: 'Active Feature Requests', value: summary.featureRequests, color: '#3b82f6' },
    { label: 'Unread Messages', value: summary.unreadMessages, color: '#16a34a' }
  ];

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Staff Messages
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Respond to system issues, feature requests, and questions from Logistics, Finance, Sales, and Owner teams.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
        {kpiCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 14,
              padding: '1rem 1.15rem'
            }}
          >
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: card.value > 0 ? card.color : 'var(--text-primary)' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: '1.25rem',
          alignItems: 'stretch'
        }}
      >
        <StaffThreadListSidebar
          isAdminView={true}
          threads={threads}
          loading={loadingList}
          selectedThreadId={selectedThreadId}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          departmentFilter={departmentFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          onSelectThread={handleSelectThread}
        />

        <StaffChatConversationPanel
          isAdminView={true}
          currentUserId={user?.id}
          thread={activeThread}
          loading={loadingThread}
          sending={sendingReply}
          updatingStatus={updatingStatus}
          errorMessage={chatError}
          onSendReply={handleSendAdminReply}
          onUpdateStatus={handleChangeThreadStatus}
        />
      </div>
    </div>
  );
};

export default StaffMessagesPage;
