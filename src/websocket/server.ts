// =====================================================
// ENTERPRISE WEBSOCKET SERVER - REAL-TIME INFRASTRUCTURE
// =====================================================
// Senior-level WebSocket server with enterprise features

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createClient } from 'redis';
import { supabase } from '@/integrations/supabase/client';
import * as jwt from 'jsonwebtoken';
import * as Sentry from '@sentry/node';

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface AuthenticatedSocket extends Socket {
  userId?: string;
  profile?: any;
  presence?: any;
}

interface RoomData {
  id: string;
  type: 'conversation' | 'p2p_room' | 'presence' | 'notifications';
  participants: Set<string>;
  data?: any;
}

interface PresenceData {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'invisible' | 'offline';
  lastSeen: Date;
  location?: { lat: number; lng: number };
  deviceInfo: any;
  appVersion: string;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  timestamp: Date;
  metadata?: any;
}

// =====================================================
// REDIS CONFIGURATION
// =====================================================

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// =====================================================
// WEBSOCKET SERVER CLASS
// =====================================================

export class EnterpriseWebSocketServer {
  private io: SocketIOServer;
  private rooms: Map<string, RoomData> = new Map();
  private presence: Map<string, PresenceData> = new Map();
  private messageQueue: Map<string, any[]> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupDatabaseListeners();
  }

  // =====================================================
  // MIDDLEWARE SETUP
  // =====================================================

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Get user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', decoded.sub)
          .single();

        if (error || !profile) {
          return next(new Error('User not found'));
        }

        socket.userId = decoded.sub;
        socket.profile = profile;

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Invalid token'));
      }
    });

    // Rate limiting middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      const key = `rate_limit:${socket.userId}`;
      const requests = await redisClient.get(key);
      
      if (requests && parseInt(requests) > 100) {
        return next(new Error('Rate limit exceeded'));
      }

      await redisClient.incr(key);
      await redisClient.expire(key, 60); // 1 minute window

      next();
    });
  }

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId}`);
      
      // Handle connection
      this.handleConnection(socket);
      
      // Setup event listeners
      this.setupSocketEventHandlers(socket);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  private setupSocketEventHandlers(socket: AuthenticatedSocket) {
    // Presence events
    socket.on('presence:update', async (data: PresenceData) => {
      await this.handlePresenceUpdate(socket, data);
    });

    socket.on('presence:subscribe', () => {
      this.handlePresenceSubscription(socket);
    });

    // Message events
    socket.on('message:send', async (data: MessageData) => {
      await this.handleMessageSend(socket, data);
    });

    socket.on('message:typing', (data: { conversationId: string; isTyping: boolean }) => {
      this.handleTypingIndicator(socket, data);
    });

    socket.on('message:read', async (data: { messageId: string }) => {
      await this.handleMessageRead(socket, data);
    });

    // Room events
    socket.on('room:join', async (data: { roomId: string; roomType: string }) => {
      await this.handleRoomJoin(socket, data);
    });

    socket.on('room:leave', async (data: { roomId: string }) => {
      await this.handleRoomLeave(socket, data);
    });

    // P2P events
    socket.on('p2p:call', (data: { targetUserId: string; offer: any }) => {
      this.handleP2PCall(socket, data);
    });

    socket.on('p2p:answer', (data: { targetUserId: string; answer: any }) => {
      this.handleP2PAnswer(socket, data);
    });

    socket.on('p2p:ice', (data: { targetUserId: string; candidate: any }) => {
      this.handleP2PIceCandidate(socket, data);
    });

    // Notification events
    socket.on('notification:mark_read', async (data: { notificationId: string }) => {
      await this.handleNotificationRead(socket, data);
    });

    // Location events
    socket.on('location:update', async (data: { lat: number; lng: number; accuracy: number }) => {
      await this.handleLocationUpdate(socket, data);
    });
  }

  // =====================================================
  // CONNECTION HANDLERS
  // =====================================================

  private async handleConnection(socket: AuthenticatedSocket) {
    try {
      // Update presence
      await this.updatePresence(socket.userId, {
        status: 'online',
        lastSeen: new Date(),
        deviceInfo: socket.handshake.headers['user-agent'],
        appVersion: socket.handshake.query.appVersion as string
      });

      // Join user to their personal rooms
      await socket.join(`user:${socket.userId}`);
      await socket.join(`notifications:${socket.userId}`);

      // Join user to their conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_one.eq.${socket.userId},participant_two.eq.${socket.userId}`);

      if (conversations) {
        for (const conv of conversations) {
          await socket.join(`conversation:${conv.id}`);
        }
      }

      // Send initial data
      socket.emit('connected', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // Broadcast presence update
      this.broadcastPresenceUpdate(socket.userId);

    } catch (error) {
      console.error('Connection handler error:', error);
      Sentry.captureException(error);
    }
  }

  private async handleDisconnection(socket: AuthenticatedSocket) {
    try {
      console.log(`User disconnected: ${socket.userId}`);

      // Update presence to offline
      await this.updatePresence(socket.userId, {
        status: 'offline',
        lastSeen: new Date()
      });

      // Broadcast presence update
      this.broadcastPresenceUpdate(socket.userId);

      // Clean up room data
      this.cleanupUserData(socket.userId);

    } catch (error) {
      console.error('Disconnection handler error:', error);
      Sentry.captureException(error);
    }
  }

  // =====================================================
  // PRESENCE HANDLERS
  // =====================================================

  private async handlePresenceUpdate(socket: AuthenticatedSocket, data: PresenceData) {
    try {
      await this.updatePresence(socket.userId, data);
      this.broadcastPresenceUpdate(socket.userId);
    } catch (error) {
      socket.emit('error', { message: 'Failed to update presence' });
    }
  }

  private handlePresenceSubscription(socket: AuthenticatedSocket) {
    socket.join('presence_updates');
    
    // Send current presence data for all online users
    const onlineUsers = Array.from(this.presence.values())
      .filter(p => p.status === 'online');
    
    socket.emit('presence:initial', onlineUsers);
  }

  private async updatePresence(userId: string, data: Partial<PresenceData>) {
    const current = this.presence.get(userId) || {
      userId,
      status: 'offline',
      lastSeen: new Date()
    };

    const updated = { ...current, ...data };
    this.presence.set(userId, updated);

    // Update database
    await supabase
      .from('presence')
      .upsert({
        user_id: userId,
        status: updated.status,
        last_seen_at: updated.lastSeen.toISOString(),
        current_location: updated.location ? 
          `SRID=4326;POINT(${updated.location.lng} ${updated.location.lat})` : null,
        location_accuracy: 0,
        location_updated_at: new Date().toISOString(),
        device_info: updated.deviceInfo,
        app_version: updated.appVersion,
        is_active: updated.status !== 'offline',
        updated_at: new Date().toISOString()
      });
  }

  private broadcastPresenceUpdate(userId: string) {
    const presence = this.presence.get(userId);
    if (!presence) return;

    this.io.to('presence_updates').emit('presence:updated', presence);
    
    // Send to friends/matches
    this.io.to(`user:${userId}`).emit('presence:updated', presence);
  }

  // =====================================================
  // MESSAGE HANDLERS
  // =====================================================

  private async handleMessageSend(socket: AuthenticatedSocket, data: MessageData) {
    try {
      // Verify user is part of conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', data.conversationId)
        .or(`participant_one.eq.${socket.userId},participant_two.eq.${socket.userId}`)
        .single();

      if (!conversation) {
        socket.emit('error', { message: 'Not authorized for this conversation' });
        return;
      }

      // Create message in database
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: socket.userId,
          content: data.content,
          message_type: data.messageType,
          metadata: data.metadata,
          delivery_status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .single();

      if (error || !message) {
        socket.emit('error', { message: 'Failed to send message' });
        return;
      }

      // Update conversation last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', data.conversationId);

      // Broadcast to conversation room
      this.io.to(`conversation:${data.conversationId}`).emit('message:new', message);

      // Send delivery confirmation
      socket.emit('message:delivered', { messageId: message.id });

    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingIndicator(socket: AuthenticatedSocket, data: { conversationId: string; isTyping: boolean }) {
    socket.to(`conversation:${data.conversationId}`).emit('typing:indicator', {
      userId: socket.userId,
      isTyping: data.isTyping,
      conversationId: data.conversationId
    });
  }

  private async handleMessageRead(socket: AuthenticatedSocket, data: { messageId: string }) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', data.messageId);

      if (error) {
        socket.emit('error', { message: 'Failed to mark message as read' });
        return;
      }

      // Broadcast read receipt
      this.io.to(`conversation:${data.conversationId}`).emit('message:read', {
        messageId: data.messageId,
        readBy: socket.userId,
        readAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Message read error:', error);
    }
  }

  // =====================================================
  // ROOM HANDLERS
  // =====================================================

  private async handleRoomJoin(socket: AuthenticatedSocket, data: { roomId: string; roomType: string }) {
    try {
      await socket.join(`room:${data.roomId}`);
      
      // Add to room tracking
      if (!this.rooms.has(data.roomId)) {
        this.rooms.set(data.roomId, {
          id: data.roomId,
          type: data.roomType as any,
          participants: new Set()
        });
      }

      const room = this.rooms.get(data.roomId)!;
      room.participants.add(socket.userId);

      // Notify other participants
      socket.to(`room:${data.roomId}`).emit('room:user_joined', {
        roomId: data.roomId,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // Send room data to user
      socket.emit('room:joined', {
        roomId: data.roomId,
        participantCount: room.participants.size
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private async handleRoomLeave(socket: AuthenticatedSocket, data: { roomId: string }) {
    try {
      await socket.leave(`room:${data.roomId}`);
      
      // Remove from room tracking
      const room = this.rooms.get(data.roomId);
      if (room) {
        room.participants.delete(socket.userId);
        
        if (room.participants.size === 0) {
          this.rooms.delete(data.roomId);
        } else {
          // Notify other participants
          socket.to(`room:${data.roomId}`).emit('room:user_left', {
            roomId: data.roomId,
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }

  // =====================================================
  // P2P HANDLERS
  // =====================================================

  private handleP2PCall(socket: AuthenticatedSocket, data: { targetUserId: string; offer: any }) {
    this.io.to(`user:${data.targetUserId}`).emit('p2p:incoming_call', {
      fromUserId: socket.userId,
      offer: data.offer,
      timestamp: new Date().toISOString()
    });
  }

  private handleP2PAnswer(socket: AuthenticatedSocket, data: { targetUserId: string; answer: any }) {
    this.io.to(`user:${data.targetUserId}`).emit('p2p:call_answer', {
      fromUserId: socket.userId,
      answer: data.answer,
      timestamp: new Date().toISOString()
    });
  }

  private handleP2PIceCandidate(socket: AuthenticatedSocket, data: { targetUserId: string; candidate: any }) {
    this.io.to(`user:${data.targetUserId}`).emit('p2p:ice_candidate', {
      fromUserId: socket.userId,
      candidate: data.candidate,
      timestamp: new Date().toISOString()
    });
  }

  // =====================================================
  // NOTIFICATION HANDLERS
  // =====================================================

  private async handleNotificationRead(socket: AuthenticatedSocket, data: { notificationId: string }) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', data.notificationId)
        .eq('user_id', socket.userId);

      if (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }

    } catch (error) {
      console.error('Notification read error:', error);
    }
  }

  // =====================================================
  // LOCATION HANDLERS
  // =====================================================

  private async handleLocationUpdate(socket: AuthenticatedSocket, data: { lat: number; lng: number; accuracy: number }) {
    try {
      await this.updatePresence(socket.userId, {
        location: { lat: data.lat, lng: data.lng }
      });

      // Update profile location
      await supabase
        .from('profiles')
        .update({
          location: `SRID=4326;POINT(${data.lng} ${data.lat})`,
          location_accuracy: data.accuracy,
          location_updated_at: new Date().toISOString()
        })
        .eq('user_id', socket.userId);

    } catch (error) {
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  // =====================================================
  // DATABASE LISTENERS
  // =====================================================

  private setupDatabaseListeners() {
    // Listen to Supabase real-time events
    const subscription = supabase
      .channel('websocket_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          this.io.to(`conversation:${payload.new.conversation_id}`)
            .emit('message:new', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          this.io.to(`notifications:${payload.new.user_id}`)
            .emit('notification:new', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'presence' },
        (payload) => {
          this.broadcastPresenceUpdate(payload.new.user_id);
        }
      )
      .subscribe();

    return subscription;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private cleanupUserData(userId: string) {
    // Remove from all rooms
    this.rooms.forEach((room, roomId) => {
      if (room.participants.has(userId)) {
        room.participants.delete(userId);
        
        if (room.participants.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    });

    // Remove presence
    this.presence.delete(userId);

    // Remove message queue
    this.messageQueue.delete(userId);
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(`room:${roomId}`).emit(event, data);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.presence.keys())
      .filter(userId => this.presence.get(userId)?.status === 'online');
  }

  public getRoomParticipants(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.participants) : [];
  }

  public async broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.io.emit('system:message', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  public getServerStats() {
    return {
      connectedUsers: this.getConnectedUsers().length,
      activeRooms: this.rooms.size,
      totalPresence: this.presence.size,
      timestamp: new Date().toISOString()
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default EnterpriseWebSocketServer;
