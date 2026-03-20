// =====================================================
// ENTERPRISE GRAPHQL RESOLVERS - COMPLETE API IMPLEMENTATION
// =====================================================
// Senior-level GraphQL resolvers with enterprise patterns

import { AuthenticationError, ForbiddenError, ValidationError } from 'apollo-server-errors';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Database, 
  MediaType, 
  MessageType, 
  VerificationStatus, 
  ReportStatus, 
  SubscriptionTier, 
  PrivacyLevel, 
  RelationshipType, 
  PresenceStatus, 
  MatchStatus 
} from '@/integrations/supabase/types';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const getUserFromContext = async (context: any) => {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in');
  }
  return context.user;
};

const checkAdminRole = (user: any) => {
  if (!['admin', 'super_admin'].includes(user.role)) {
    throw new ForbiddenError('Admin access required');
  }
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// =====================================================
// PROFILE RESOLVERS
// =====================================================

export const profileResolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      const user = await getUserFromContext(context);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          media_items(*),
          matches(*),
          ai_profiles(*),
          subscriptions(*),
          privacy_settings(*),
          presence(*),
          user_metrics(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        throw new Error('Profile not found');
      }

      return profile;
    },

    profile: async (parent: any, { userId }: { userId: string }, context: any) => {
      const user = await getUserFromContext(context);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          media_items(*),
          ai_profiles(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        throw new Error('Profile not found');
      }

      // Check privacy settings
      const { data: privacy } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (privacy?.profile_visibility === 'private' && userId !== user.id) {
        throw new ForbiddenError('Profile is private');
      }

      return profile;
    },

    profiles: async (parent: any, { limit = 50, offset = 0, filter }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          media_items(*),
          ai_profiles(*)
        `)
        .eq('is_active', true)
        .eq('is_banned', false)
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filter?.minAge) {
        query = query.gte('age', filter.minAge);
      }
      if (filter?.maxAge) {
        query = query.lte('age', filter.maxAge);
      }
      if (filter?.relationshipTypes) {
        query = query.contains('relationship_goals', filter.relationshipTypes);
      }

      const { data: profiles, error } = await query;

      if (error) {
        throw new Error('Failed to fetch profiles');
      }

      return profiles || [];
    },

    nearbyUsers: async (parent: any, { lat, lng, maxDistanceMeters = 50000, limit = 50, filters }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      // Use the enhanced database function
      const { data: nearbyUsers, error } = await supabase
        .rpc('find_nearby_users_enhanced', {
          lat,
          lng,
          max_dist_meters: maxDistanceMeters,
          limit_count: limit,
          filters: filters || {}
        });

      if (error) {
        throw new Error('Failed to find nearby users');
      }

      return nearbyUsers || [];
    }
  },

  Mutation: {
    updateProfile: async (parent: any, { input }: { input: any }, context: any) => {
      const user = await getUserFromContext(context);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          display_name: input.displayName,
          bio: input.bio,
          age: input.age,
          height: input.height,
          weight: input.weight,
          body_type: input.bodyType,
          ethnicity: input.ethnicity,
          languages: input.languages,
          education: input.education,
          occupation: input.occupation,
          income_range: input.incomeRange,
          lifestyle: input.lifestyle,
          relationship_goals: input.relationshipGoals,
          hiv_status: input.hivStatus,
          prep_status: input.prepStatus,
          last_test_date: input.lastTestDate,
          vaccination_status: input.vaccinationStatus,
          preferred_position: input.preferredPosition,
          kinks: input.kinks,
          limits: input.limits,
          safe_sex_only: input.safeSexOnly,
          party_friendly: input.partyFriendly,
          cannabis_friendly: input.cannabisFriendly,
          poppers_friendly: input.poppersFriendly,
          chemsex_friendly: input.chemsexFriendly,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error || !profile) {
        throw new Error('Failed to update profile');
      }

      // Update location if provided
      if (input.location) {
        await supabase
          .from('profiles')
          .update({
            location: `SRID=4326;POINT(${input.location.lng} ${input.location.lat})`,
            location_updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      // Update interests and tribes
      if (input.interests || input.tribes || input.lookingFor) {
        await supabase
          .from('profiles')
          .update({
            interests: input.interests || [],
            tribes: input.tribes || [],
            looking_for: input.lookingFor || []
          })
          .eq('user_id', user.id);
      }

      return profile;
    },

    updatePrivacySettings: async (parent: any, { input }: { input: any }, context: any) => {
      const user = await getUserFromContext(context);
      
      const { data: settings, error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          profile_visibility: input.profileVisibility,
          location_visibility: input.locationVisibility,
          last_seen_visibility: input.lastSeenVisibility,
          online_status_visibility: input.onlineStatusVisibility,
          gallery_visibility: input.galleryVisibility,
          allow_stranger_messages: input.allowStrangerMessages,
          allow_friend_requests: input.allowFriendRequests,
          allow_tagging: input.allowTagging,
          allow_screenshots: input.allowScreenshots,
          auto_delete_messages: input.autoDeleteMessages,
          message_retention_days: input.messageRetentionDays,
          blur_stranger_photos: input.blurStrangerPhotos,
          hide_age: input.hideAge,
          hide_distance: input.hideDistance,
          data_collection_opt_out: input.dataCollectionOptOut,
          ai_training_opt_out: input.aiTrainingOptOut,
          analytics_opt_out: input.analyticsOptOut,
          marketing_opt_out: input.marketingOptOut,
          search_opt_out: input.searchOptOut,
          blocked_countries: input.blockedCountries || [],
          time_restriction_start: input.timeRestrictionStart,
          time_restriction_end: input.timeRestrictionEnd,
          do_not_disturb: input.doNotDisturb,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error || !settings) {
        throw new Error('Failed to update privacy settings');
      }

      return settings;
    },

    deleteProfile: async (parent: any, { reason }: { reason: string }, context: any) => {
      const user = await getUserFromContext(context);
      
      // Soft delete profile
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          ban_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to delete profile');
      }

      // Call cleanup function
      await supabase.rpc('cleanup_user_data', { user_id_to_cleanup: user.id });

      return true;
    }
  }
};

// =====================================================
// MATCHING RESOLVERS
// =====================================================

export const matchResolvers = {
  Query: {
    matches: async (parent: any, { limit = 50, offset = 0, status }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      let query = supabase
        .from('matches')
        .select(`
          *,
          user_one_profile:profiles!matches_user_one_fkey(*),
          user_two_profile:profiles!matches_user_two_fkey(*)
        `)
        .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: matches, error } = await query;

      if (error) {
        throw new Error('Failed to fetch matches');
      }

      return matches || [];
    },

    matchSuggestions: async (parent: any, { limit = 10 }: { limit: number }, context: any) => {
      const user = await getUserFromContext(context);
      
      // Get user's location
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_id', user.id)
        .single();

      if (!profile?.location) {
        throw new Error('Location required for match suggestions');
      }

      // Extract coordinates from geography point
      const locationStr = profile.location as string;
      const coords = locationStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      
      if (!coords) {
        throw new Error('Invalid location format');
      }

      const lng = parseFloat(coords[1]);
      const lat = parseFloat(coords[2]);

      // Get match preferences
      const { data: preferences } = await supabase
        .from('match_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Find nearby users with AI matching
      const { data: suggestions, error } = await supabase
        .rpc('find_nearby_users_enhanced', {
          lat,
          lng,
          max_dist_meters: 50000,
          limit_count: limit,
          filters: preferences || {}
        });

      if (error) {
        throw new Error('Failed to get match suggestions');
      }

      return suggestions || [];
    }
  },

  Mutation: {
    createMatch: async (parent: any, { userId }: { userId: string }, context: any) => {
      const user = await getUserFromContext(context);
      
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user_one.eq.${user.id},user_two.eq.${userId}),and(user_one.eq.${userId},user_two.eq.${user.id})`)
        .single();

      if (existingMatch) {
        throw new Error('Match already exists');
      }

      // Calculate match score
      const { data: matchScore } = await supabase
        .rpc('calculate_match_score', { 
          user1_id: user.id, 
          user2_id: userId 
        });

      // Create match
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          user_one: user.id,
          user_two: userId,
          initiated_by: user.id,
          match_score: matchScore || 0.5,
          status: 'pending',
          match_algorithm: 'hybrid',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error || !match) {
        throw new Error('Failed to create match');
      }

      return match;
    },

    updateMatch: async (parent: any, { id, status }: { id: string; status: MatchStatus }, context: any) => {
      const user = await getUserFromContext(context);
      
      // Verify user is part of the match
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
        .single();

      if (!match) {
        throw new ForbiddenError('Not authorized to update this match');
      }

      const { data: updatedMatch, error } = await supabase
        .from('matches')
        .update({
          status,
          last_interaction_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !updatedMatch) {
        throw new Error('Failed to update match');
      }

      return updatedMatch;
    }
  }
};

// =====================================================
// MESSAGING RESOLVERS
// =====================================================

export const messageResolvers = {
  Query: {
    conversations: async (parent: any, { limit = 50, offset = 0 }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_one_profile:profiles!conversations_participant_one_fkey(*),
          participant_two_profile:profiles!conversations_participant_two_fkey(*),
          messages(
            *,
            sender:profiles!messages_sender_id_fkey(*)
          )
        `)
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error('Failed to fetch conversations');
      }

      return conversations || [];
    },

    messages: async (parent: any, { conversationId, limit = 50, offset = 0 }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      // Verify user is part of the conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .single();

      if (!conversation) {
        throw new ForbiddenError('Not authorized to view this conversation');
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          reply_to:messages!messages_reply_to_id_fkey(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error('Failed to fetch messages');
      }

      return messages || [];
    }
  },

  Mutation: {
    sendMessage: async (parent: any, { conversationId, input }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      // Verify user is part of the conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .single();

      if (!conversation) {
        throw new ForbiddenError('Not authorized to send messages to this conversation');
      }

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: input.content,
          message_type: input.messageType,
          media_url: input.mediaUrl,
          reply_to_id: input.replyToId,
          priority: input.priority,
          encryption_key: input.encryptionKey,
          metadata: input.metadata,
          delivery_status: 'sent',
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          reply_to:messages!messages_reply_to_id_fkey(*)
        `)
        .single();

      if (error || !message) {
        throw new Error('Failed to send message');
      }

      // Update conversation's last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return message;
    },

    markMessageAsRead: async (parent: any, { id }: { id: string }, context: any) => {
      const user = await getUserFromContext(context);
      
      const { data: message, error } = await supabase
        .from('messages')
        .select('*, conversation_id')
        .eq('id', id)
        .single();

      if (error || !message) {
        throw new Error('Message not found');
      }

      // Verify user is part of the conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', message.conversation_id)
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .single();

      if (!conversation) {
        throw new ForbiddenError('Not authorized to update this message');
      }

      const { data: updatedMessage, error: updateError } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError || !updatedMessage) {
        throw new Error('Failed to mark message as read');
      }

      return updatedMessage;
    }
  }
};

// =====================================================
// MEDIA RESOLVERS
// =====================================================

export const mediaResolvers = {
  Query: {
    mediaItems: async (parent: any, { galleryId, userId, limit = 50, offset = 0 }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      let query = supabase
        .from('media_items')
        .select('*')
        .range(offset, offset + limit - 1);

      if (galleryId) {
        query = query.eq('gallery_id', galleryId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      // Apply privacy filters
      if (userId !== user.id) {
        query = query.eq('is_private', false);
      }

      const { data: mediaItems, error } = await query;

      if (error) {
        throw new Error('Failed to fetch media items');
      }

      return mediaItems || [];
    }
  },

  Mutation: {
    uploadMedia: async (parent: any, { file, input }: any, context: any) => {
      const user = await getUserFromContext(context);
      
      // This would integrate with your file upload service
      // For now, we'll simulate the upload
      const fileUrl = `https://your-cdn.com/media/${user.id}/${Date.now()}-${file.name}`;
      
      const { data: mediaItem, error } = await supabase
        .from('media_items')
        .insert({
          user_id: user.id,
          url: fileUrl,
          thumbnail_url: input.thumbnailUrl,
          blur_hash: input.blurHash,
          type: input.type,
          file_size: input.fileSize,
          width: input.width,
          height: input.height,
          duration: input.duration,
          caption: input.caption,
          tags: input.tags || [],
          is_private: input.isPrivate,
          is_ephemeral: input.isEphemeral,
          expires_at: input.expiresAt,
          content_rating: input.contentRating,
          metadata: input.metadata,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error || !mediaItem) {
        throw new Error('Failed to upload media');
      }

      return mediaItem;
    }
  }
};

// =====================================================
// ADMIN RESOLVERS
// =====================================================

export const adminResolvers = {
  Query: {
    adminUsers: async (parent: any, { limit = 100, offset = 0, filter }: any, context: any) => {
      const user = await getUserFromContext(context);
      checkAdminRole(user);
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user:auth.users(*),
          subscriptions(*),
          user_metrics(*)
        `)
        .range(offset, offset + limit - 1);

      if (filter) {
        // Apply admin filters
        if (filter?.banned) {
          query = query.eq('is_banned', true);
        }
        if (filter?.premium) {
          query = query.eq('is_premium', true);
        }
        if (filter?.verificationStatus) {
          query = query.eq('verification_status', filter.verificationStatus);
        }
      }

      const { data: users, error } = await query;

      if (error) {
        throw new Error('Failed to fetch admin users');
      }

      return users || [];
    },

    adminReports: async (parent: any, { limit = 100, offset = 0, status }: any, context: any) => {
      const user = await getUserFromContext(context);
      checkAdminRole(user);
      
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(*),
          reported:profiles!reports_reported_id_fkey(*),
          assigned_to_profile:profiles!reports_assigned_to_fkey(*),
          moderation_actions(*)
        `)
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: reports, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch admin reports');
      }

      return reports || [];
    },

    adminAnalytics: async (parent: any, { startDate, endDate }: any, context: any) => {
      const user = await getUserFromContext(context);
      checkAdminRole(user);
      
      // This would integrate with your analytics service
      // For now, return basic metrics
      const { data: userCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .gte('last_online_at', startDate);

      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate);

      const { data: revenue } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('status', 'active');

      return {
        totalUsers: userCount?.length || 0,
        activeUsers: activeUsers?.length || 0,
        newUsers: newUsers?.length || 0,
        revenue: revenue?.length || 0,
        period: { startDate, endDate }
      };
    }
  },

  Mutation: {
    updateUserRole: async (parent: any, { userId, role }: any, context: any) => {
      const user = await getUserFromContext(context);
      checkAdminRole(user);
      
      // Update user role in auth.users (this would need admin access)
      // For now, we'll store it in profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !profile) {
        throw new Error('Failed to update user role');
      }

      return profile;
    },

    banUser: async (parent: any, { userId, reason, duration }: any, context: any) => {
      const user = await getUserFromContext(context);
      checkAdminRole(user);
      
      // Calculate ban expiration
      const expiresAt = duration ? 
        new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      const { data: action, error } = await supabase
        .from('moderation_actions')
        .insert({
          user_id: userId,
          moderator_id: user.id,
          action: 'ban',
          reason,
          duration,
          expires_at: expiresAt,
          is_permanent: !duration,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error || !action) {
        throw new Error('Failed to ban user');
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: reason,
          ban_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return action;
    },

    approveVerificationRequest: async (parent: any, { id }: { id: string }, context: any) => {
      const user = await getUserFromContext(context);
      checkAdminRole(user);
      
      const { data: request, error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !request) {
        throw new Error('Failed to approve verification request');
      }

      // Update user verification status
      await supabase
        .from('profiles')
        .update({
          verification_status: 'approved',
          is_verified: true,
          verification_score: 100,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', request.user_id);

      return request;
    }
  }
};

// =====================================================
// ROOT RESOLVER
// =====================================================

export const resolvers = {
  Query: {
    ...profileResolvers.Query,
    ...matchResolvers.Query,
    ...messageResolvers.Query,
    ...mediaResolvers.Query,
    ...adminResolvers.Query
  },
  
  Mutation: {
    ...profileResolvers.Mutation,
    ...matchResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...mediaResolvers.Mutation,
    ...adminResolvers.Mutation
  }
};

// =====================================================
// SUBSCRIPTION RESOLVERS
// =====================================================

export const subscriptionResolvers = {
  userUpdated: {
    subscribe: (parent: any, { userId }: { userId: string }, context: any) => {
      return context.pubsub.asyncIterator(`USER_UPDATED_${userId}`);
    }
  },
  
  profileUpdated: {
    subscribe: (parent: any, { userId }: { userId: string }, context: any) => {
      return context.pubsub.asyncIterator(`PROFILE_UPDATED_${userId}`);
    }
  },
  
  newMatch: {
    subscribe: (parent: any, args: any, context: any) => {
      const user = getUserFromContext(context);
      return context.pubsub.asyncIterator(`NEW_MATCH_${user.id}`);
    }
  },
  
  newMessage: {
    subscribe: (parent: any, { conversationId }: { conversationId: string }, context: any) => {
      return context.pubsub.asyncIterator(`NEW_MESSAGE_${conversationId}`);
    }
  },
  
  newNotification: {
    subscribe: (parent: any, { userId }: { userId: string }, context: any) => {
      return context.pubsub.asyncIterator(`NEW_NOTIFICATION_${userId}`);
    }
  }
};
