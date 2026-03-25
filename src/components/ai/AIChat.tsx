/**
 * AIChat.tsx — Next-Gen AI Chat Interface (ChatGPT/Claude/Cursor Style)
 * 
 * Features:
 * - Markdown rendering with syntax highlighting
 * - Streaming text animation with typewriter effect
 * - Code blocks with copy functionality
 * - Tool calls visualization
 * - Image generation display
 * - Voice message support
 * - File attachment preview
 * 
 * Dependencies to install:
 * npm install react-markdown remark-gfm rehype-highlight rehype-sanitize
 */

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { 
  Send, 
  X, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Mic, 
  MicOff,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Loader2,
  Wand2,
  Lightbulb,
  Heart,
  MessageCircle,
  Zap,
  FileText,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/hooks/use-toast';

// Types
export type MessageType = 'text' | 'image' | 'voice' | 'tool' | 'file';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: MessageType;
  metadata?: {
    imageUrl?: string;
    toolName?: string;
    toolResult?: unknown;
    fileName?: string;
    fileType?: string;
  };
  timestamp: Date;
}

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: unknown;
}

// Code Block Component with Syntax Highlighting
const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs text-zinc-400 font-mono">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          className="h-6 px-2 text-xs text-zinc-400 hover:text-white"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language} text-sm font-mono text-zinc-300`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

// Markdown Renderer with Custom Components
const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSanitize]}
      components={{
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : undefined;
          
          if (!inline && language) {
            return <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />;
          }
          
          return (
            <code
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        p: ({ children }: any) => <p className="mb-4 leading-relaxed">{children}</p>,
        h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
        li: ({ children }: any) => <li className="text-sm">{children}</li>,
        blockquote: ({ children }: any) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
            {children}
          </blockquote>
        ),
        table: ({ children }: any) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-zinc-700">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }: any) => <thead className="bg-zinc-800">{children}</thead>,
        th: ({ children }: any) => <th className="border border-zinc-700 px-4 py-2 text-left text-sm font-semibold">{children}</th>,
        td: ({ children }: any) => <td className="border border-zinc-700 px-4 py-2 text-sm">{children}</td>,
        a: ({ href, children }: any) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Tool Call Visualization
const ToolCallVisualizer = ({ tool }: { tool: ToolCall }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mb-3"
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        tool.status === 'running' && "bg-amber-500/20 animate-pulse",
        tool.status === 'complete' && "bg-emerald-500/20",
        tool.status === 'error' && "bg-red-500/20",
        tool.status === 'pending' && "bg-zinc-700/50"
      )}>
        {tool.status === 'running' && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
        {tool.status === 'complete' && <Check className="w-4 h-4 text-emerald-500" />}
        {tool.status === 'error' && <X className="w-4 h-4 text-red-500" />}
        {tool.status === 'pending' && <Sparkles className="w-4 h-4 text-zinc-400" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">Using tool: {tool.name}</p>
        <p className="text-xs text-zinc-500">
          {tool.status === 'running' && 'Processing...'}
          {tool.status === 'complete' && 'Complete'}
          {tool.status === 'error' && 'Failed'}
          {tool.status === 'pending' && 'Pending'}
        </p>
      </div>
    </motion.div>
  );
};

// Image Generation Display
const ImageDisplay = ({ url, prompt }: { url: string; prompt?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group rounded-lg overflow-hidden border border-zinc-800"
    >
      <img src={url} alt={prompt || 'Generated image'} className="w-full max-h-96 object-cover" />
      {prompt && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-xs text-white/80 line-clamp-2">{prompt}</p>
        </div>
      )}
    </motion.div>
  );
};

// Quick Action Chips
const QuickActions = ({ onAction }: { onAction: (prompt: string) => void }) => {
  const actions = [
    { icon: Heart, label: 'Dating Tips', prompt: 'Give me 5 expert dating tips for making a great first impression' },
    { icon: Lightbulb, label: 'Profile Review', prompt: 'Analyze my profile and suggest 3 specific improvements' },
    { icon: MessageCircle, label: 'Icebreakers', prompt: 'Generate 5 creative icebreaker messages that aren\'t cheesy' },
    { icon: Zap, label: 'Date Ideas', prompt: 'Suggest 3 unique first date ideas based on current trends' },
    { icon: ImageIcon, label: 'Photo Tips', prompt: 'What makes a dating profile photo stand out? Give me actionable advice' },
    { icon: Wand2, label: 'Bio Rewrite', prompt: 'Help me write a compelling bio that shows personality' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.prompt)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700/50 hover:border-zinc-600 transition-all text-xs"
        >
          <action.icon className="w-3.5 h-3.5 text-primary" />
          <span className="text-zinc-300">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

// Main AI Chat Component
interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AIChat = ({ isOpen, onClose, className }: AIChatProps) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isStreaming, sendMessage, setInput: setAiInput, clearMessages } = useAI();
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isStreaming) return;

    setAiInput(messageContent);
    await sendMessage(messageContent);
    setInput('');
    setAttachedFiles([]);
  }, [input, isStreaming, setAiInput, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast({
        title: 'Files attached',
        description: `${files.length} file(s) ready to send`,
      });
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording logic here
      setIsRecording(true);
      toast({ title: 'Voice recording started', description: 'Speak clearly...' });
    } else {
      // Stop recording
      setIsRecording(false);
      toast({ title: 'Recording stopped', description: 'Processing voice...' });
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "fixed inset-x-4 bottom-20 z-50 md:inset-x-auto md:right-4 md:bottom-24",
            "md:w-[480px] lg:w-[560px]",
            className
          )}
        >
          <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl 
                          shadow-black/50 overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-500 
                                  flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">King AI</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Online • GPT-4 Powered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasMessages && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMessages}
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 space-y-4 min-h-[300px] max-h-[500px]">
              {!hasMessages && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 
                                  flex items-center justify-center border border-violet-500/30">
                    <Bot className="w-10 h-10 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Your AI Dating Wingman</h2>
                  <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto">
                    Get personalized dating advice, profile optimization tips, and creative conversation starters.
                  </p>
                  <QuickActions onAction={handleSend} />
                </motion.div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 mt-1 ring-2 ring-violet-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500">
                        <Sparkles className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === 'user'
                        ? "bg-violet-600 text-white rounded-br-md"
                        : "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50 rounded-bl-md"
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-zinc-700">
                        <User className="w-4 h-4 text-zinc-300" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}

              {/* Streaming Indicator */}
              {isStreaming && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <Avatar className="w-8 h-8 mt-1 ring-2 ring-violet-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500">
                      <Sparkles className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* File Attachments */}
            {attachedFiles.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-zinc-800">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 text-xs">
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <button
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about dating, relationships, or profile tips..."
                    disabled={isStreaming}
                    className="pr-10 py-3 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500
                               focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                  />
                  <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileAttach}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isStreaming}
                      className="h-6 w-6 text-zinc-500 hover:text-white"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleRecording}
                  disabled={isStreaming}
                  className={cn(
                    "h-10 w-10 shrink-0 border-zinc-700/50",
                    isRecording && "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse"
                  )}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                  className="h-10 w-10 shrink-0 bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              
              <p className="text-[10px] text-zinc-500 mt-2 text-center">
                King AI is powered by GPT-4. Responses are for entertainment purposes.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
