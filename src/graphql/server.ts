// =====================================================
// ENTERPRISE APOLLO SERVER CONFIGURATION
// =====================================================
// Senior-level Apollo Server with enterprise features

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambda } from '@apollo/server/standalone';
import { GraphQLUpload } from 'graphql-upload/GraphQLUpload.js';
import { GraphQLJSON } from 'graphql-type-json';
import { GraphQLScalarType } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import { typeDefs } from './schema';
import { resolvers, subscriptionResolvers } from './resolvers';
import { supabase } from '@/integrations/supabase/client';
import * as Sentry from '@sentry/node';

// =====================================================
// CUSTOM SCALAR TYPES
// =====================================================

const GeographyScalar = new GraphQLScalarType({
  name: 'Geography',
  description: 'Geography type for PostGIS spatial data',
  serialize(value: any) {
    return value; // Convert outgoing value to JSON
  },
  parseValue(value: any) {
    return value; // Convert incoming JSON to value
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case 'StringValue':
      case 'ObjectValue':
        return ast.value;
      default:
        return null;
    }
  }
});

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === 'StringValue') {
      return new Date(ast.value);
    }
    return null;
  }
});

// =====================================================
// PUBSUB CONFIGURATION
// =====================================================

const pubsub = new PubSub({
  // Redis configuration for production
  // For development, use in-memory pubsub
});

// =====================================================
// CONTEXT BUILDER
// =====================================================

interface Context {
  user?: any;
  pubsub: PubSub;
  supabase: any;
  req: any;
}

const createContext = async ({ req }: { req: any }): Promise<Context> => {
  // Get user from JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');
  let user = null;

  if (token) {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        // Get user profile with role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', authUser.id)
          .single();
        
        user = { ...authUser, role: profile?.role || 'user' };
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  return {
    user,
    pubsub,
    supabase,
    req
  };
};

// =====================================================
// APOLLO SERVER CONFIGURATION
// =====================================================

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers: {
    ...resolvers,
    ...subscriptionResolvers,
    Upload: GraphQLUpload,
    JSON: GraphQLJSON,
    Geography: GeographyScalar,
    DateTime: DateTimeScalar
  },
  
  // Subscription configuration
  plugins: [
    // Add monitoring plugins here
  ],
  
  // Validation rules
  validationRules: [
    // Add custom validation rules here
  ],
  
  // Context creation
  context: createContext,
  
  // Format error responses
  formatError: (error) => {
    // Log to Sentry
    Sentry.captureException(error);
    
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      path: error.path,
      locations: error.locations,
      timestamp: new Date().toISOString()
    };
  },
  
  // Enable introspection in development
  introspection: process.env.NODE_ENV !== 'production',
  
  // Cache configuration
  cache: 'bounded',
  
  // Plugins
  plugins: [
    // Add Apollo Server plugins here
    // Example: responseCachePlugin(),
  ]
});

// =====================================================
// SUBSCRIPTION RESOLVERS WITH REAL-TIME
// =====================================================

export const enhancedSubscriptionResolvers = {
  userUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('USER_UPDATED'),
      (payload, variables) => {
        return payload.userUpdated.id === variables.userId;
      }
    )
  },
  
  profileUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('PROFILE_UPDATED'),
      (payload, variables) => {
        return payload.profileUpdated.user_id === variables.userId;
      }
    )
  },
  
  newMatch: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('NEW_MATCH'),
      (payload, variables, context) => {
        // Only send to users involved in the match
        const match = payload.newMatch;
        return match.user_one === context.user?.id || match.user_two === context.user?.id;
      }
    )
  },
  
  newMessage: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('NEW_MESSAGE'),
      (payload, variables) => {
        return payload.newMessage.conversation_id === variables.conversationId;
      }
    )
  },
  
  newNotification: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('NEW_NOTIFICATION'),
      (payload, variables, context) => {
        return payload.newNotification.user_id === context.user?.id;
      }
    )
  },
  
  presenceUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('PRESENCE_UPDATED'),
      (payload, variables) => {
        return payload.presenceUpdated.user_id === variables.userId;
      }
    )
  }
};

// =====================================================
// REAL-TIME EVENT EMITTERS
// =====================================================

export class RealTimeEvents {
  constructor(private pubsub: PubSub) {}

  // User events
  emitUserUpdated(user: any) {
    this.pubsub.publish('USER_UPDATED', { userUpdated: user });
  }

  emitProfileUpdated(profile: any) {
    this.pubsub.publish('PROFILE_UPDATED', { profileUpdated: profile });
  }

  emitPresenceUpdated(presence: any) {
    this.pubsub.publish('PRESENCE_UPDATED', { presenceUpdated: presence });
  }

  // Match events
  emitNewMatch(match: any) {
    this.pubsub.publish('NEW_MATCH', { newMatch: match });
  }

  emitMatchUpdated(match: any) {
    this.pubsub.publish('MATCH_UPDATED', { matchUpdated: match });
  }

  // Message events
  emitNewMessage(message: any) {
    this.pubsub.publish('NEW_MESSAGE', { newMessage: message });
  }

  emitMessageUpdated(message: any) {
    this.pubsub.publish('MESSAGE_UPDATED', { messageUpdated: message });
  }

  emitTypingStatus(conversationId: string, user: any, isTyping: boolean) {
    this.pubsub.publish('TYPING_STATUS', { 
      conversationId, 
      user, 
      isTyping 
    });
  }

  // Notification events
  emitNewNotification(notification: any) {
    this.pubsub.publish('NEW_NOTIFICATION', { newNotification: notification });
  }

  // Admin events
  emitNewReport(report: any) {
    this.pubsub.publish('NEW_REPORT', { newReport: report });
  }

  emitNewVerificationRequest(request: any) {
    this.pubsub.publish('NEW_VERIFICATION_REQUEST', { 
      newVerificationRequest: request 
    });
  }
}

// =====================================================
// DATABASE EVENT LISTENERS
// =====================================================

export const setupDatabaseListeners = (pubsub: PubSub, realTimeEvents: RealTimeEvents) => {
  // Listen to Supabase real-time events
  const subscription = supabase
    .channel('database_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      (payload) => {
        realTimeEvents.emitProfileUpdated(payload.new);
        realTimeEvents.emitUserUpdated(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'matches' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          realTimeEvents.emitNewMatch(payload.new);
        } else {
          realTimeEvents.emitMatchUpdated(payload.new);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        realTimeEvents.emitNewMessage(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      (payload) => {
        realTimeEvents.emitNewNotification(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'presence' },
      (payload) => {
        realTimeEvents.emitPresenceUpdated(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reports' },
      (payload) => {
        realTimeEvents.emitNewReport(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'verification_requests' },
      (payload) => {
        realTimeEvents.emitNewVerificationRequest(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// =====================================================
// HEALTH CHECK
// =====================================================

export const healthCheck = async () => {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error('Database connection failed');
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      database: 'connected',
      pubsub: 'active'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

// =====================================================
// METRICS AND MONITORING
// =====================================================

export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Track metrics
    console.log({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    });
    
    // Send to monitoring service
    // Example: Prometheus, DataDog, etc.
  });
  
  next();
};

// =====================================================
// RATE LIMITING
// =====================================================

const rateLimitMap = new Map();

export const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
  return (req: any, res: any, next: any) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, []);
    }
    
    const requests = rateLimitMap.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    rateLimitMap.set(key, validRequests);
    
    next();
  };
};

// =====================================================
// EXPORTS
// =====================================================

export { server };
export type { Context };
