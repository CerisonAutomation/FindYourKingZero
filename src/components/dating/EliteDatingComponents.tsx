/**
 * Elite Dating Components
 * Production-grade swipe cards, match modals, and interactive elements
 * Based on brave-date, humbble, and aroma-main repos
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Heart, X, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════
// PROFILE CARD - Elite Swipeable Dating Card
// ═══════════════════════════════════════════════════════════════

interface ProfileData {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  job?: string;
  education?: string;
  location?: string;
  distance?: string;
  interests?: string[];
  verified?: boolean;
}

interface ProfileCardProps {
  profile: ProfileData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp?: () => void;
  isActive?: boolean;
}

export function ProfileCard({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isActive = true
}: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0, 1, 1, 1, 0]
  );

  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0]);
  const superLikeOpacity = useTransform(y, [-150, 0], [1, 0]);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number }; velocity: { x: number } }) => {
    const threshold = 100;
    const velocity = 500;

    if (info.offset.x > threshold || info.velocity.x > velocity) {
      setExitDirection('right');
      onSwipeRight();
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      setExitDirection('left');
      onSwipeLeft();
    } else if (info.offset.y < -threshold && onSwipeUp) {
      onSwipeUp();
    } else {
      // Reset position
      x.set(0);
      y.set(0);
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, x, y]);

  const handlePhotoTap = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.stopPropagation();
    if (side === 'left' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    } else if (side === 'right' && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  return (
    <motion.div
      className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl touch-none"
      style={{
        x: springX,
        y: springY,
        rotate,
        opacity,
        cursor: isActive ? 'grab' : 'default'
      }}
      drag={isActive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        x: exitDirection === 'left' ? -500 : 500,
        rotate: exitDirection === 'left' ? -45 : 45,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileTap={{ cursor: 'grabbing', scale: 1.02 }}
    >
      {/* Photo Stack */}
      <div className="absolute inset-0 bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentPhotoIndex}
            src={profile.photos[currentPhotoIndex]}
            alt={`${profile.name}'s photo ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Photo Navigation Zones */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={(e) => handlePhotoTap(e, 'left')}
          />
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={(e) => handlePhotoTap(e, 'right')}
          />
        </div>

        {/* Photo Indicators */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {profile.photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === currentPhotoIndex
                  ? 'bg-white'
                  : idx < currentPhotoIndex
                    ? 'bg-white/60'
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute top-8 left-8 border-4 border-green-500 rounded-xl px-4 py-2 bg-black/20"
          style={{ opacity: likeOpacity, rotate: -20 }}
        >
          <span className="text-3xl font-bold text-green-500 uppercase tracking-wider">LIKE</span>
        </motion.div>

        <motion.div
          className="absolute top-8 right-8 border-4 border-red-500 rounded-xl px-4 py-2 bg-black/20"
          style={{ opacity: nopeOpacity, rotate: 20 }}
        >
          <span className="text-3xl font-bold text-red-500 uppercase tracking-wider">NOPE</span>
        </motion.div>

        <motion.div
          className="absolute top-24 left-1/2 -translate-x-1/2 border-4 border-blue-500 rounded-xl px-4 py-2 bg-black/20"
          style={{ opacity: superLikeOpacity }}
        >
          <span className="text-2xl font-bold text-blue-500 uppercase tracking-wider">SUPER LIKE</span>
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-3xl font-bold">
              {profile.name}
              {profile.verified && (
                <Badge className="ml-2 bg-blue-500 text-white inline-flex items-center">
                  <Star className="w-3 h-3 fill-current" />
                </Badge>
              )}
            </h2>
            <span className="text-2xl font-light">{profile.age}</span>
          </div>

          {profile.job && (
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Briefcase className="w-4 h-4" />
              <span>{profile.job}</span>
            </div>
          )}

          {profile.education && (
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>{profile.education}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-2 text-white/80 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
              {profile.distance && (
                <span className="text-white/60">({profile.distance})</span>
              )}
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.interests.slice(0, 4).map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {profile.bio && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MATCH MODAL - Stunning Match Animation
// ═══════════════════════════════════════════════════════════════

interface MatchData {
  userName: string;
  userPhoto: string;
  matchName: string;
  matchPhoto: string;
}

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchData;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({ isOpen, onClose, match, onSendMessage, onKeepSwiping }: MatchModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md p-8 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Background Burst */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.8 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-20 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full"
                  style={{
                    transformOrigin: 'center bottom',
                    rotate: i * 30,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.6,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </motion.div>

            {/* Photos */}
            <div className="relative flex justify-center items-center mb-6">
              <motion.div
                className="relative z-10"
                initial={{ x: -100, opacity: 0, rotate: -20 }}
                animate={{ x: 0, opacity: 1, rotate: -10 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <img
                  src={match.userPhoto}
                  alt="Your photo"
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                />
              </motion.div>

              <motion.div
                className="absolute z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              </motion.div>

              <motion.div
                className="relative z-10"
                initial={{ x: 100, opacity: 0, rotate: 20 }}
                animate={{ x: 0, opacity: 1, rotate: 10 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <img
                  src={match.matchPhoto}
                  alt={`${match.matchName}'s photo`}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                />
              </motion.div>
            </div>

            {/* Text */}
            <motion.h2
              className="text-4xl font-bold text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              It&apos;s a Match!
            </motion.h2>

            <motion.p
              className="text-white/80 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              You and {match.matchName} liked each other
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={onSendMessage}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-6 rounded-full shadow-lg"
              >
                Send a Message
              </Button>

              <Button
                onClick={onKeepSwiping}
                variant="ghost"
                className="w-full text-white/80 hover:text-white hover:bg-white/10"
              >
                Keep Swiping
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACTION BUTTONS - Swipe Controls
// ═══════════════════════════════════════════════════════════════

interface ActionButtonsProps {
  onDislike: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onBoost?: () => void;
}

export function ActionButtons({ onDislike, onSuperLike, onLike, onBoost }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDislike}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
      >
        <X className="w-7 h-7" />
      </motion.button>

      {onBoost && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBoost}
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-purple-500 hover:bg-purple-50 transition-colors"
        >
          <Star className="w-6 h-6 fill-current" />
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
      >
        <Star className="w-6 h-6 fill-current" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
      >
        <Heart className="w-7 h-7 fill-current" />
      </motion.button>
    </div>
  );
}
