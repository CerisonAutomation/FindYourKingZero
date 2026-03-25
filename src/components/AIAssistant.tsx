import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Bot, Lightbulb, MessageCircle, Send, Sparkles, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {useAI} from '@/hooks/useAI';
import {cn} from '@/lib/utils';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_PROMPTS = [
    {icon: Lightbulb, label: 'Profile tips', prompt: 'Give me 3 tips to improve my dating profile'},
    {icon: MessageCircle, label: 'Icebreakers', prompt: 'Suggest some creative icebreaker messages'},
    {icon: Sparkles, label: 'Bio ideas', prompt: 'Help me write an engaging bio'},
];

export const AIAssistant = ({isOpen, onClose}: AIAssistantProps) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {messages, isStreaming, sendMessage, setInput: setAiInput} = useAI();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleSend = async (content?: string) => {
        const messageContent = content || input;
        if (!messageContent.trim() || isStreaming) return;

        setAiInput(messageContent);
        await sendMessage(messageContent);
        setInput('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0, y: 100}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 100}}
                    className="fixed inset-x-4 bottom-20 z-50 md:inset-x-auto md:right-4 md:bottom-24 md:w-96"
                >
                    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div
                            className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-primary"/>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Find Your King AI</h3>
                                    <p className="text-xs text-muted-foreground">Your dating assistant</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5"/>
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && !isStreaming && (
                                <div className="text-center py-8">
                                    <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
                                    <p className="text-muted-foreground mb-4">
                                        Hi! I'm here to help with your dating journey. Ask me anything!
                                    </p>
                                    <div className="space-y-2">
                                        {QUICK_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt.label}
                                                onClick={() => handleSend(prompt.prompt)}
                                                className="flex items-center gap-2 w-full p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left text-sm"
                                            >
                                                <prompt.icon className="w-4 h-4 text-primary"/>
                                                {prompt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    className={cn(
                                        "flex gap-2",
                                        message.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar className="w-8 h-8 bg-primary/20">
                                            <AvatarFallback>
                                                <Bot className="w-4 h-4 text-primary"/>
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                                            message.role === 'user'
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary"
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                                <motion.div
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="flex gap-2 justify-start"
                                >
                                    <Avatar className="w-8 h-8 bg-primary/20">
                                        <AvatarFallback>
                                            <Bot className="w-4 h-4 text-primary"/>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm bg-secondary">
                                        <span className="inline-block w-1 h-4 bg-primary animate-pulse"/>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef}/>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    disabled={isStreaming}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isStreaming}
                                >
                                    <Send className="w-4 h-4"/>
                                </Button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
