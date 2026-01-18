'use client';

/**
 * TEAM CHAT CONTEXT
 * Real-time chat state management with Supabase Realtime
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';
import { moderateMessage, ModerationResult } from '@/lib/chat/moderation';
import { generateAIResponse, getTimeOfDay, ChicagoTeam } from '@/lib/chat/ai-responder';

// =====================================================
// TYPES
// =====================================================

export interface ChatUser {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  badge?: 'verified' | 'og_fan' | 'contributor' | 'moderator' | 'staff' | 'ai';
  reputationScore: number;
  isBanned: boolean;
  mutedUntil?: Date;
  favoriteTeamSlug?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  user?: ChatUser;
  content: string;
  contentType: 'text' | 'gif' | 'image' | 'system';
  gifUrl?: string;
  replyToId?: string;
  replyTo?: ChatMessage;
  threadRootId?: string;
  threadReplyCount: number;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  reactionCounts: Record<string, number>;
  userReactions?: string[]; // Emojis the current user has reacted with
  isDeleted: boolean;
  createdAt: Date;
  editedAt?: Date;
  isOptimistic?: boolean; // For optimistic UI updates
  moderationResult?: ModerationResult;
}

export interface ChatRoom {
  id: string;
  teamSlug: string;
  teamName: string;
  teamColor: string;
  description?: string;
  isActive: boolean;
  slowModeSeconds: number;
  onlineCount: number;
}

export interface DMConversation {
  id: string;
  participantId: string;
  participant?: ChatUser;
  lastMessageAt: Date;
  lastMessagePreview?: string;
  unreadCount: number;
}

export interface DMMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: ChatUser;
  content: string;
  contentType: 'text' | 'gif';
  gifUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatState {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;

  // Current user
  chatUser?: ChatUser;
  isAuthenticated: boolean;

  // Rooms
  rooms: ChatRoom[];
  currentRoom?: ChatRoom;
  currentTeam?: ChicagoTeam;

  // Messages
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;

  // Threads
  activeThread?: ChatMessage;
  threadReplies: ChatMessage[];

  // DMs
  dmConversations: DMConversation[];
  currentDMConversation?: DMConversation;
  dmMessages: DMMessage[];
  totalUnreadDMs: number;

  // UI State
  isOpen: boolean;
  activeTab: 'room' | 'dms' | 'history';
  showEmojiPicker: boolean;
  showGifPicker: boolean;
  replyingTo?: ChatMessage;
  editingMessage?: ChatMessage;

  // Rate limiting
  lastMessageTime: number;
  messageCountLastMinute: number;
  canSendMessage: boolean;
  cooldownSeconds: number;

  // Staff presence
  staffOnline: boolean;
  onlineUsers: ChatUser[];

  // Typing indicators
  typingUsers: string[];
}

type ChatAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTION_ERROR'; payload: string | undefined }
  | { type: 'SET_CHAT_USER'; payload: ChatUser | undefined }
  | { type: 'SET_ROOMS'; payload: ChatRoom[] }
  | { type: 'SET_CURRENT_ROOM'; payload: ChatRoom | undefined }
  | { type: 'SET_CURRENT_TEAM'; payload: ChicagoTeam | undefined }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
  | { type: 'SET_ACTIVE_THREAD'; payload: ChatMessage | undefined }
  | { type: 'SET_THREAD_REPLIES'; payload: ChatMessage[] }
  | { type: 'ADD_THREAD_REPLY'; payload: ChatMessage }
  | { type: 'SET_DM_CONVERSATIONS'; payload: DMConversation[] }
  | { type: 'SET_CURRENT_DM'; payload: DMConversation | undefined }
  | { type: 'SET_DM_MESSAGES'; payload: DMMessage[] }
  | { type: 'ADD_DM_MESSAGE'; payload: DMMessage }
  | { type: 'SET_TOTAL_UNREAD_DMS'; payload: number }
  | { type: 'TOGGLE_CHAT'; payload?: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: 'room' | 'dms' | 'history' }
  | { type: 'TOGGLE_EMOJI_PICKER'; payload?: boolean }
  | { type: 'TOGGLE_GIF_PICKER'; payload?: boolean }
  | { type: 'SET_REPLYING_TO'; payload: ChatMessage | undefined }
  | { type: 'SET_EDITING_MESSAGE'; payload: ChatMessage | undefined }
  | { type: 'UPDATE_RATE_LIMIT'; payload: { lastMessageTime: number; messageCount: number } }
  | { type: 'SET_CAN_SEND_MESSAGE'; payload: { canSend: boolean; cooldown: number } }
  | { type: 'SET_STAFF_ONLINE'; payload: boolean }
  | { type: 'SET_ONLINE_USERS'; payload: ChatUser[] }
  | { type: 'SET_TYPING_USERS'; payload: string[] }
  | { type: 'ADD_REACTION'; payload: { messageId: string; emoji: string; userId: string } }
  | { type: 'REMOVE_REACTION'; payload: { messageId: string; emoji: string; userId: string } };

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: ChatState = {
  isConnected: false,
  isConnecting: false,
  connectionError: undefined,
  chatUser: undefined,
  isAuthenticated: false,
  rooms: [],
  currentRoom: undefined,
  currentTeam: undefined,
  messages: [],
  isLoadingMessages: false,
  hasMoreMessages: true,
  activeThread: undefined,
  threadReplies: [],
  dmConversations: [],
  currentDMConversation: undefined,
  dmMessages: [],
  totalUnreadDMs: 0,
  isOpen: false,
  activeTab: 'room',
  showEmojiPicker: false,
  showGifPicker: false,
  replyingTo: undefined,
  editingMessage: undefined,
  lastMessageTime: 0,
  messageCountLastMinute: 0,
  canSendMessage: true,
  cooldownSeconds: 0,
  staffOnline: false,
  onlineUsers: [],
  typingUsers: [],
};

// =====================================================
// REDUCER
// =====================================================

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };

    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };

    case 'SET_CONNECTION_ERROR':
      return { ...state, connectionError: action.payload };

    case 'SET_CHAT_USER':
      return {
        ...state,
        chatUser: action.payload,
        isAuthenticated: !!action.payload,
      };

    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };

    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };

    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADD_MESSAGE': {
      // Prevent duplicates
      if (state.messages.some(m => m.id === action.payload.id)) {
        return state;
      }
      // Add and sort by timestamp
      const newMessages = [...state.messages, action.payload].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      // Keep only last 200 messages in memory
      return {
        ...state,
        messages: newMessages.slice(-200),
      };
    }

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(m => m.id !== action.payload),
      };

    case 'SET_LOADING_MESSAGES':
      return { ...state, isLoadingMessages: action.payload };

    case 'SET_HAS_MORE_MESSAGES':
      return { ...state, hasMoreMessages: action.payload };

    case 'SET_ACTIVE_THREAD':
      return { ...state, activeThread: action.payload, threadReplies: [] };

    case 'SET_THREAD_REPLIES':
      return { ...state, threadReplies: action.payload };

    case 'ADD_THREAD_REPLY': {
      if (state.threadReplies.some(r => r.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        threadReplies: [...state.threadReplies, action.payload].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      };
    }

    case 'SET_DM_CONVERSATIONS':
      return { ...state, dmConversations: action.payload };

    case 'SET_CURRENT_DM':
      return { ...state, currentDMConversation: action.payload };

    case 'SET_DM_MESSAGES':
      return { ...state, dmMessages: action.payload };

    case 'ADD_DM_MESSAGE': {
      if (state.dmMessages.some(m => m.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        dmMessages: [...state.dmMessages, action.payload].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      };
    }

    case 'SET_TOTAL_UNREAD_DMS':
      return { ...state, totalUnreadDMs: action.payload };

    case 'TOGGLE_CHAT':
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen,
      };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'TOGGLE_EMOJI_PICKER':
      return {
        ...state,
        showEmojiPicker: action.payload !== undefined ? action.payload : !state.showEmojiPicker,
        showGifPicker: false,
      };

    case 'TOGGLE_GIF_PICKER':
      return {
        ...state,
        showGifPicker: action.payload !== undefined ? action.payload : !state.showGifPicker,
        showEmojiPicker: false,
      };

    case 'SET_REPLYING_TO':
      return { ...state, replyingTo: action.payload };

    case 'SET_EDITING_MESSAGE':
      return { ...state, editingMessage: action.payload };

    case 'UPDATE_RATE_LIMIT':
      return {
        ...state,
        lastMessageTime: action.payload.lastMessageTime,
        messageCountLastMinute: action.payload.messageCount,
      };

    case 'SET_CAN_SEND_MESSAGE':
      return {
        ...state,
        canSendMessage: action.payload.canSend,
        cooldownSeconds: action.payload.cooldown,
      };

    case 'SET_STAFF_ONLINE':
      return { ...state, staffOnline: action.payload };

    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };

    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };

    case 'ADD_REACTION': {
      const { messageId, emoji } = action.payload;
      return {
        ...state,
        messages: state.messages.map(m => {
          if (m.id !== messageId) return m;
          const currentCount = m.reactionCounts[emoji] || 0;
          return {
            ...m,
            reactionCounts: { ...m.reactionCounts, [emoji]: currentCount + 1 },
            userReactions: [...(m.userReactions || []), emoji],
          };
        }),
      };
    }

    case 'REMOVE_REACTION': {
      const { messageId, emoji } = action.payload;
      return {
        ...state,
        messages: state.messages.map(m => {
          if (m.id !== messageId) return m;
          const currentCount = m.reactionCounts[emoji] || 1;
          const newCounts = { ...m.reactionCounts };
          if (currentCount <= 1) {
            delete newCounts[emoji];
          } else {
            newCounts[emoji] = currentCount - 1;
          }
          return {
            ...m,
            reactionCounts: newCounts,
            userReactions: (m.userReactions || []).filter(e => e !== emoji),
          };
        }),
      };
    }

    default:
      return state;
  }
}

// =====================================================
// CONTEXT
// =====================================================

interface ChatContextValue extends ChatState {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;

  // Room management
  joinRoom: (teamSlug: ChicagoTeam) => Promise<void>;
  leaveRoom: () => void;

  // Messages
  sendMessage: (content: string, contentType?: 'text' | 'gif', gifUrl?: string) => Promise<ModerationResult | null>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;

  // Threads
  openThread: (message: ChatMessage) => void;
  closeThread: () => void;
  sendThreadReply: (content: string) => Promise<void>;

  // Reactions
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;

  // DMs
  openDM: (userId: string) => Promise<void>;
  sendDM: (content: string) => Promise<void>;
  closeDM: () => void;
  loadDMConversations: () => Promise<void>;

  // UI
  toggleChat: (isOpen?: boolean) => void;
  setActiveTab: (tab: 'room' | 'dms' | 'history') => void;
  toggleEmojiPicker: (show?: boolean) => void;
  toggleGifPicker: (show?: boolean) => void;
  setReplyingTo: (message: ChatMessage | undefined) => void;
  cancelEdit: () => void;

  // Typing
  sendTypingIndicator: () => void;

  // Reports
  reportMessage: (messageId: string, reason: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// =====================================================
// PROVIDER
// =====================================================

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();

  // Refs for Supabase connection
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const roomChannelRef = useRef<RealtimeChannel | null>(null);
  const dmChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  // Initialize Supabase client
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseRef.current) {
      supabaseRef.current = createClient(supabaseUrl, supabaseKey);
    }
  }, []);

  // Sync auth state
  useEffect(() => {
    if (user && supabaseRef.current) {
      loadOrCreateChatUser();
    } else {
      dispatch({ type: 'SET_CHAT_USER', payload: undefined });
    }
  }, [user]);

  // Load rooms on mount
  useEffect(() => {
    if (supabaseRef.current) {
      loadRooms();
    }
  }, []);

  // =====================================================
  // DATA LOADING
  // =====================================================

  async function loadRooms() {
    if (!supabaseRef.current) return;

    try {
      const { data, error } = await supabaseRef.current
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('team_name');

      if (error) throw error;

      const rooms: ChatRoom[] = (data || []).map(r => ({
        id: r.id,
        teamSlug: r.team_slug,
        teamName: r.team_name,
        teamColor: r.team_color,
        description: r.description,
        isActive: r.is_active,
        slowModeSeconds: r.slow_mode_seconds,
        onlineCount: 0,
      }));

      dispatch({ type: 'SET_ROOMS', payload: rooms });
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  }

  async function loadOrCreateChatUser() {
    if (!supabaseRef.current || !user) return;

    try {
      // Try to get existing chat user
      let { data: chatUser, error } = await supabaseRef.current
        .from('chat_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create one
        const { data: newUser, error: createError } = await supabaseRef.current
          .from('chat_users')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Fan',
            avatar_url: user.user_metadata?.avatar_url,
          })
          .select()
          .single();

        if (createError) throw createError;
        chatUser = newUser;
      } else if (error) {
        throw error;
      }

      if (chatUser) {
        dispatch({
          type: 'SET_CHAT_USER',
          payload: {
            id: chatUser.id,
            userId: chatUser.user_id,
            displayName: chatUser.display_name,
            avatarUrl: chatUser.avatar_url,
            badge: chatUser.badge,
            reputationScore: chatUser.reputation_score,
            isBanned: chatUser.is_banned,
            mutedUntil: chatUser.muted_until ? new Date(chatUser.muted_until) : undefined,
            favoriteTeamSlug: chatUser.favorite_team_slug,
          },
        });
      }
    } catch (error) {
      console.error('Error loading chat user:', error);
    }
  }

  async function loadMessages(roomId: string, before?: Date) {
    if (!supabaseRef.current) return;

    dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });

    try {
      let query = supabaseRef.current
        .from('chat_messages')
        .select(`
          *,
          user:chat_users(*)
        `)
        .eq('room_id', roomId)
        .eq('moderation_status', 'approved')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (before) {
        query = query.lt('created_at', before.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const messages: ChatMessage[] = (data || []).map(transformMessage).reverse();

      if (before) {
        // Prepend to existing messages
        dispatch({
          type: 'SET_MESSAGES',
          payload: [...messages, ...state.messages],
        });
      } else {
        dispatch({ type: 'SET_MESSAGES', payload: messages });
      }

      dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: (data || []).length === 50 });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
    }
  }

  function transformMessage(data: Record<string, unknown>): ChatMessage {
    const user = data.user as Record<string, unknown> | undefined;
    return {
      id: data.id as string,
      roomId: data.room_id as string,
      userId: data.user_id as string,
      user: user ? {
        id: user.id as string,
        userId: user.user_id as string,
        displayName: user.display_name as string,
        avatarUrl: user.avatar_url as string | undefined,
        badge: user.badge as ChatUser['badge'],
        reputationScore: user.reputation_score as number,
        isBanned: user.is_banned as boolean,
      } : undefined,
      content: data.content as string,
      contentType: data.content_type as ChatMessage['contentType'],
      gifUrl: data.gif_url as string | undefined,
      replyToId: data.reply_to_id as string | undefined,
      threadRootId: data.thread_root_id as string | undefined,
      threadReplyCount: data.thread_reply_count as number,
      moderationStatus: data.moderation_status as ChatMessage['moderationStatus'],
      reactionCounts: (data.reaction_counts as Record<string, number>) || {},
      isDeleted: data.is_deleted as boolean,
      createdAt: new Date(data.created_at as string),
      editedAt: data.edited_at ? new Date(data.edited_at as string) : undefined,
    };
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  const subscribeToRoom = useCallback(async (roomId: string) => {
    if (!supabaseRef.current) return;

    // Unsubscribe from previous room
    if (roomChannelRef.current) {
      await supabaseRef.current.removeChannel(roomChannelRef.current);
    }

    // Subscribe to new messages
    roomChannelRef.current = supabaseRef.current
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch full message with user data
          const { data, error } = await supabaseRef.current!
            .from('chat_messages')
            .select(`*, user:chat_users(*)`)
            .eq('id', payload.new.id)
            .single();

          if (!error && data && data.moderation_status === 'approved') {
            dispatch({ type: 'ADD_MESSAGE', payload: transformMessage(data) });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              id: payload.new.id,
              updates: {
                content: payload.new.content,
                moderationStatus: payload.new.moderation_status,
                reactionCounts: payload.new.reaction_counts,
                isDeleted: payload.new.is_deleted,
                editedAt: payload.new.edited_at ? new Date(payload.new.edited_at) : undefined,
              },
            },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          dispatch({ type: 'REMOVE_MESSAGE', payload: payload.old.id });
        }
      )
      .subscribe();

    dispatch({ type: 'SET_CONNECTED', payload: true });
  }, []);

  const subscribeToPresence = useCallback(async (roomId: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    if (presenceChannelRef.current) {
      await supabaseRef.current.removeChannel(presenceChannelRef.current);
    }

    presenceChannelRef.current = supabaseRef.current
      .channel(`presence:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannelRef.current?.presenceState() || {};
        const users: ChatUser[] = [];
        let hasStaff = false;

        Object.values(presenceState).forEach((presences: unknown) => {
          (presences as Array<{ user: ChatUser }>).forEach(p => {
            if (p.user) {
              users.push(p.user);
              if (p.user.badge === 'staff' || p.user.badge === 'moderator') {
                hasStaff = true;
              }
            }
          });
        });

        dispatch({ type: 'SET_ONLINE_USERS', payload: users });
        dispatch({ type: 'SET_STAFF_ONLINE', payload: hasStaff });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && state.chatUser) {
          await presenceChannelRef.current?.track({
            user: state.chatUser,
            online_at: new Date().toISOString(),
          });
        }
      });
  }, [state.chatUser]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const connect = useCallback(async () => {
    dispatch({ type: 'SET_CONNECTING', payload: true });
    try {
      // Connection happens through subscriptions
      dispatch({ type: 'SET_CONNECTING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_ERROR', payload: 'Failed to connect' });
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (supabaseRef.current) {
      if (roomChannelRef.current) {
        supabaseRef.current.removeChannel(roomChannelRef.current);
      }
      if (dmChannelRef.current) {
        supabaseRef.current.removeChannel(dmChannelRef.current);
      }
      if (presenceChannelRef.current) {
        supabaseRef.current.removeChannel(presenceChannelRef.current);
      }
    }
    dispatch({ type: 'SET_CONNECTED', payload: false });
  }, []);

  const joinRoom = useCallback(async (teamSlug: ChicagoTeam) => {
    const room = state.rooms.find(r => r.teamSlug === teamSlug);
    if (!room) return;

    dispatch({ type: 'SET_CURRENT_ROOM', payload: room });
    dispatch({ type: 'SET_CURRENT_TEAM', payload: teamSlug });
    dispatch({ type: 'SET_MESSAGES', payload: [] });

    await loadMessages(room.id);
    await subscribeToRoom(room.id);
    await subscribeToPresence(room.id);
  }, [state.rooms, subscribeToRoom, subscribeToPresence]);

  const leaveRoom = useCallback(() => {
    disconnect();
    dispatch({ type: 'SET_CURRENT_ROOM', payload: undefined });
    dispatch({ type: 'SET_CURRENT_TEAM', payload: undefined });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
  }, [disconnect]);

  const sendMessage = useCallback(async (
    content: string,
    contentType: 'text' | 'gif' = 'text',
    gifUrl?: string
  ): Promise<ModerationResult | null> => {
    if (!supabaseRef.current || !state.chatUser || !state.currentRoom) {
      return null;
    }

    // Check if user is muted
    if (state.chatUser.mutedUntil && new Date() < state.chatUser.mutedUntil) {
      return {
        approved: false,
        action: 'block',
        flags: [],
        score: 0,
        blockedReason: `You are muted until ${state.chatUser.mutedUntil.toLocaleString()}`,
      };
    }

    // Moderate the message
    const moderationResult = moderateMessage(content, {
      userId: state.chatUser.id,
      messageHistory: state.messages.slice(-10).map(m => ({
        content: m.content,
        timestamp: m.createdAt.getTime(),
      })),
      lastMessageTime: state.lastMessageTime,
      messageCountLastMinute: state.messageCountLastMinute,
      messageCountLastHour: 0, // Would need to track this
      isNewUser: false, // Would need to check account age
      warningCount: 0,
    });

    if (!moderationResult.approved) {
      return moderationResult;
    }

    // Optimistic update
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      roomId: state.currentRoom.id,
      userId: state.chatUser.id,
      user: state.chatUser,
      content,
      contentType,
      gifUrl,
      replyToId: state.replyingTo?.id,
      threadReplyCount: 0,
      moderationStatus: 'approved',
      reactionCounts: {},
      isDeleted: false,
      createdAt: new Date(),
      isOptimistic: true,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: optimisticMessage });
    dispatch({ type: 'SET_REPLYING_TO', payload: undefined });

    try {
      const { data, error } = await supabaseRef.current
        .from('chat_messages')
        .insert({
          room_id: state.currentRoom.id,
          user_id: state.chatUser.id,
          content,
          content_type: contentType,
          gif_url: gifUrl,
          reply_to_id: state.replyingTo?.id,
          moderation_status: 'approved',
          moderation_flags: moderationResult.flags,
          moderation_score: moderationResult.score,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      dispatch({ type: 'REMOVE_MESSAGE', payload: optimisticId });

      // Update rate limiting
      dispatch({
        type: 'UPDATE_RATE_LIMIT',
        payload: {
          lastMessageTime: Date.now(),
          messageCount: state.messageCountLastMinute + 1,
        },
      });

      // Check if AI should respond (when no staff online)
      if (!state.staffOnline && state.currentTeam) {
        const aiConfig = {
          team: state.currentTeam,
          recentMessages: state.messages.slice(-10).map(m => ({
            id: m.id,
            content: m.content,
            userName: m.user?.displayName || 'Fan',
            isStaff: m.user?.badge === 'staff' || m.user?.badge === 'moderator',
            isAI: m.user?.badge === 'ai',
            timestamp: m.createdAt,
          })),
          userQuestion: content,
          userName: state.chatUser.displayName,
          staffOnline: state.staffOnline,
          timeOfDay: getTimeOfDay(),
        };

        // Generate AI response in background
        generateAIResponse(aiConfig).then(async (aiResponse) => {
          if (aiResponse.shouldRespond && aiResponse.content && supabaseRef.current) {
            // Small delay to feel natural
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

            // Insert AI response
            await supabaseRef.current.from('chat_messages').insert({
              room_id: state.currentRoom!.id,
              user_id: 'ai-assistant', // Special AI user ID
              content: aiResponse.content,
              content_type: 'text',
              moderation_status: 'approved',
            });
          }
        });
      }

      return moderationResult;
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      dispatch({ type: 'REMOVE_MESSAGE', payload: optimisticId });
      return null;
    }
  }, [state.chatUser, state.currentRoom, state.currentTeam, state.replyingTo, state.messages, state.lastMessageTime, state.messageCountLastMinute, state.staffOnline]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    const moderationResult = moderateMessage(newContent);
    if (!moderationResult.approved) return;

    try {
      await supabaseRef.current
        .from('chat_messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('user_id', state.chatUser.id);

      dispatch({ type: 'SET_EDITING_MESSAGE', payload: undefined });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, [state.chatUser]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    try {
      await supabaseRef.current
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('user_id', state.chatUser.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [state.chatUser]);

  const loadMoreMessages = useCallback(async () => {
    if (!state.currentRoom || !state.hasMoreMessages || state.isLoadingMessages) return;

    const oldestMessage = state.messages[0];
    if (oldestMessage) {
      await loadMessages(state.currentRoom.id, oldestMessage.createdAt);
    }
  }, [state.currentRoom, state.hasMoreMessages, state.isLoadingMessages, state.messages]);

  const openThread = useCallback((message: ChatMessage) => {
    dispatch({ type: 'SET_ACTIVE_THREAD', payload: message });
    // Load thread replies
    // ... implementation
  }, []);

  const closeThread = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_THREAD', payload: undefined });
  }, []);

  const sendThreadReply = useCallback(async (_content: string) => {
    // Implementation for thread replies
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    // Optimistic update
    dispatch({
      type: 'ADD_REACTION',
      payload: { messageId, emoji, userId: state.chatUser.id },
    });

    try {
      await supabaseRef.current.from('chat_reactions').insert({
        message_id: messageId,
        user_id: state.chatUser.id,
        emoji,
      });
    } catch (error) {
      // Revert on error
      dispatch({
        type: 'REMOVE_REACTION',
        payload: { messageId, emoji, userId: state.chatUser.id },
      });
    }
  }, [state.chatUser]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    // Optimistic update
    dispatch({
      type: 'REMOVE_REACTION',
      payload: { messageId, emoji, userId: state.chatUser.id },
    });

    try {
      await supabaseRef.current
        .from('chat_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', state.chatUser.id)
        .eq('emoji', emoji);
    } catch (error) {
      // Revert on error
      dispatch({
        type: 'ADD_REACTION',
        payload: { messageId, emoji, userId: state.chatUser.id },
      });
    }
  }, [state.chatUser]);

  const openDM = useCallback(async (_userId: string) => {
    // Implementation for opening DM
  }, []);

  const sendDM = useCallback(async (_content: string) => {
    // Implementation for sending DM
  }, []);

  const closeDM = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_DM', payload: undefined });
    dispatch({ type: 'SET_DM_MESSAGES', payload: [] });
  }, []);

  const loadDMConversations = useCallback(async () => {
    // Implementation for loading DM conversations
  }, []);

  const toggleChat = useCallback((isOpen?: boolean) => {
    dispatch({ type: 'TOGGLE_CHAT', payload: isOpen });
  }, []);

  const setActiveTab = useCallback((tab: 'room' | 'dms' | 'history') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const toggleEmojiPicker = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_EMOJI_PICKER', payload: show });
  }, []);

  const toggleGifPicker = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_GIF_PICKER', payload: show });
  }, []);

  const setReplyingTo = useCallback((message: ChatMessage | undefined) => {
    dispatch({ type: 'SET_REPLYING_TO', payload: message });
  }, []);

  const cancelEdit = useCallback(() => {
    dispatch({ type: 'SET_EDITING_MESSAGE', payload: undefined });
  }, []);

  const sendTypingIndicator = useCallback(() => {
    // Implementation for typing indicator
  }, []);

  const reportMessage = useCallback(async (messageId: string, reason: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    try {
      const message = state.messages.find(m => m.id === messageId);
      await supabaseRef.current.from('chat_reports').insert({
        reporter_id: state.chatUser.id,
        reported_user_id: message?.userId,
        message_id: messageId,
        reason,
      });
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  }, [state.chatUser, state.messages]);

  const blockUser = useCallback(async (userId: string) => {
    if (!supabaseRef.current || !state.chatUser) return;

    try {
      await supabaseRef.current.from('chat_user_blocks').insert({
        blocker_id: state.chatUser.id,
        blocked_id: userId,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }, [state.chatUser]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value: ChatContextValue = {
    ...state,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    openThread,
    closeThread,
    sendThreadReply,
    addReaction,
    removeReaction,
    openDM,
    sendDM,
    closeDM,
    loadDMConversations,
    toggleChat,
    setActiveTab,
    toggleEmojiPicker,
    toggleGifPicker,
    setReplyingTo,
    cancelEdit,
    sendTypingIndicator,
    reportMessage,
    blockUser,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// =====================================================
// HOOK
// =====================================================

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
