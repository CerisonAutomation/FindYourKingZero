// =====================================================
// VIRTUAL MESSAGE LIST — Renders only visible messages
// Uses fixed-height virtual scrolling for performance
// with long conversation histories
// =====================================================
import {memo, useEffect, useRef} from 'react';
import {useVirtualScroll} from '@/hooks/useVirtualScroll';
import {cn} from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface VirtualMessageListProps {
  messages: Message[];
  currentUserId: string;
  /** Fixed height of each message bubble container */
  itemHeight?: number;
  /** Extra items to render outside viewport */
  overscan?: number;
  className?: string;
  /** Render function for individual messages */
  renderMessage?: (message: Message, isMine: boolean) => React.ReactNode;
}

/**
 * Default message renderer — simple bubble layout.
 */
function DefaultMessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <div
      className={cn(
        'flex',
        isMine ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm',
        )}
      >
        <p className="break-words">{message.content}</p>
        <span
          className={cn(
            'text-[10px] mt-1 block',
            isMine ? 'text-primary-foreground/60' : 'text-muted-foreground',
          )}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

/**
 * VirtualMessageList — Only renders messages currently visible in the scroll container.
 * Uses useVirtualScroll hook with fixed item height for O(1) rendering of any list length.
 */
function VirtualMessageListInner({
  messages,
  currentUserId,
  itemHeight = 80,
  overscan = 10,
  className,
  renderMessage,
}: VirtualMessageListProps) {
  const { containerRef, virtualItems, totalHeight, scrollToIndex } = useVirtualScroll({
    itemHeight,
    overscan,
    itemCount: messages.length,
  });

  // Auto-scroll to bottom when new messages arrive
  const prevCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      scrollToIndex(messages.length - 1, 'end');
    }
    prevCountRef.current = messages.length;
  }, [messages.length, scrollToIndex]);

  // Scroll to bottom on initial mount
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToIndex(messages.length - 1, 'end');
      });
    }
  }, []);

  const render = renderMessage ?? ((msg: Message, mine: boolean) => (
    <DefaultMessageBubble message={msg} isMine={mine} />
  ));

  return (
    <div
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
    >
      {/* Spacer for total virtual height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, offsetTop }) => {
          const msg = messages[index];
          const isMine = msg.sender_id === currentUserId;

          return (
            <div
              key={msg.id}
              style={{
                position: 'absolute',
                top: offsetTop,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
              className="flex items-center px-3"
            >
              {render(msg, isMine)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualMessageList = memo(VirtualMessageListInner);
VirtualMessageList.displayName = 'VirtualMessageList';

export default VirtualMessageList;
