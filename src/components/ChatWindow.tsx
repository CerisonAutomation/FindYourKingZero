import {useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {
    BadgeCheck,
    Calendar,
    Check,
    CheckCheck,
    ChevronLeft,
    Crown,
    Image,
    Mic,
    MoreVertical,
    Phone,
    Send,
    Video
} from 'lucide-react';
import {Conversation, Message} from '@/types';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {cn} from '@/lib/utils';

interface ChatWindowProps {
    conversation: Conversation;
    onBack: () => void;
    onViewProfile: (profileId: string) => void;
}

const mockMessages: Message[] = [
    {
        id: '1',
        conversationId: 'conv1',
        senderId: 'other',
        content: 'Hey there! I saw your profile and you seem really interesting 😊',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        isEncrypted: true,
    },
    {
        id: '2',
        conversationId: 'conv1',
        senderId: 'current-user',
        content: 'Thanks! Your profile caught my eye too. Love the photos!',
        type: 'text',
        timestamp: new Date(Date.now() - 3500000),
        status: 'read',
        isEncrypted: true,
    },
    {
        id: '3',
        conversationId: 'conv1',
        senderId: 'other',
        content: 'Would you be interested in grabbing coffee sometime?',
        type: 'text',
        timestamp: new Date(Date.now() - 3400000),
        status: 'read',
        isEncrypted: true,
    },
    {
        id: '4',
        conversationId: 'conv1',
        senderId: 'current-user',
        content: "That sounds great! I know a nice spot in SoHo if you're interested",
        type: 'text',
        timestamp: new Date(Date.now() - 3300000),
        status: 'read',
        isEncrypted: true,
    },
    {
        id: '5',
        conversationId: 'conv1',
        senderId: 'other',
        content: 'Perfect! When are you free?',
        type: 'text',
        timestamp: new Date(Date.now() - 300000),
        status: 'delivered',
        isEncrypted: true,
    },
];

export function ChatWindow({conversation, onBack, onViewProfile}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now().toString(),
            conversationId: conversation.id,
            senderId: 'current-user',
            content: newMessage,
            type: 'text',
            timestamp: new Date(),
            status: 'sent',
            isEncrypted: true,
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // Simulate typing indicator
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const renderMessageStatus = (status: Message['status']) => {
        switch (status) {
            case 'sent':
                return <Check className="w-3.5 h-3.5 text-muted-foreground"/>;
            case 'delivered':
                return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground"/>;
            case 'read':
                return <CheckCheck className="w-3.5 h-3.5 text-primary"/>;
        }
    };

    return (
        <motion.div
            initial={{x: '100%'}}
            animate={{x: 0}}
            exit={{x: '100%'}}
            transition={{type: 'spring', damping: 25, stiffness: 200}}
            className="fixed inset-0 bg-background z-50 flex flex-col"
        >
            {/* Header */}
            <header className="glass border-b border-border/50 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1">
                    <ChevronLeft className="w-6 h-6"/>
                </button>

                <button
                    onClick={() => onViewProfile(conversation.participant.id)}
                    className="flex items-center gap-3 flex-1"
                >
                    <div className="relative">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={conversation.participant.avatar}/>
                            <AvatarFallback>{conversation.participant.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.participant.isOnline && (
                            <div
                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background"/>
                        )}
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{conversation.participant.name}</span>
                            {conversation.participant.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-primary"/>
                            )}
                            {conversation.participant.isPremium && (
                                <Crown className="w-4 h-4 text-gold"/>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">
              {conversation.participant.isOnline ? 'Online' : 'Last seen recently'}
            </span>
                    </div>
                </button>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone className="w-5 h-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Video className="w-5 h-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-5 h-5"/>
                    </Button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {/* Encryption Notice */}
                <div className="text-center py-4">
          <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">
            🔒 Messages are end-to-end encrypted
          </span>
                </div>

                {messages.map((message, index) => {
                    const isOwn = message.senderId === 'current-user';
                    const showAvatar = !isOwn && (
                        index === 0 || messages[index - 1].senderId !== message.senderId
                    );

                    return (
                        <motion.div
                            key={message.id}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.05}}
                            className={cn("flex items-end gap-2", isOwn && "justify-end")}
                        >
                            {!isOwn && (
                                <div className="w-8">
                                    {showAvatar && (
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={conversation.participant.avatar}/>
                                            <AvatarFallback>{conversation.participant.name[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[75%] px-4 py-2.5 rounded-2xl",
                                isOwn
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-secondary rounded-bl-md"
                            )}>
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <div className={cn(
                                    "flex items-center gap-1 mt-1",
                                    isOwn ? "justify-end" : "justify-start"
                                )}>
                  <span className={cn(
                      "text-[10px]",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {formatTime(message.timestamp)}
                  </span>
                                    {isOwn && renderMessageStatus(message.status)}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        className="flex items-end gap-2"
                    >
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={conversation.participant.avatar}/>
                            <AvatarFallback>{conversation.participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="px-4 py-3 rounded-2xl bg-secondary rounded-bl-md">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                                     style={{animationDelay: '0ms'}}/>
                                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                                     style={{animationDelay: '150ms'}}/>
                                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                                     style={{animationDelay: '300ms'}}/>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef}/>
            </div>

            {/* Quick Actions */}
            {conversation.participant.role === 'provider' && (
                <div className="px-4 py-2 border-t border-border/50">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/30 hover:bg-primary/10"
                    >
                        <Calendar className="w-4 h-4 mr-2"/>
                        Quick Book
                    </Button>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/50 glass">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <Image className="w-5 h-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <Mic className="w-5 h-5"/>
                    </Button>
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-secondary/50 border-border/50"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="shrink-0 gradient-primary"
                    >
                        <Send className="w-5 h-5"/>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
