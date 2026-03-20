import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceNavigation } from '@/hooks/voice/useVoiceNavigation';
import { useVoiceAutoReply, AutoReplyConfig } from '@/hooks/voice/useAutoReply';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { log } from '@/lib/enterprise/Logger';

interface VoiceAssistantButtonProps {
  className?: string;
  autoReplyConfig?: AutoReplyConfig;
  onAutoReplyConfigChange?: (config: AutoReplyConfig) => void;
  showSettings?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
}

export const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({
  className,
  autoReplyConfig,
  onAutoReplyConfigChange,
  showSettings = true,
  size = 'md',
  variant = 'default'
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const voiceNav = useVoiceNavigation();
  const voiceAutoReply = useVoiceAutoReply(autoReplyConfig || {
    enabled: false,
    context: '',
    personality: 'friendly',
    responseLength: 'medium',
    autoSend: false,
    confidenceThreshold: 0.7
  });

  // Size configurations
  const sizeConfig = {
    sm: { button: 'h-10 w-10', icon: 'h-4 w-4', buttonSize: 'sm' as const },
    md: { button: 'h-12 w-12', icon: 'h-5 w-5', buttonSize: 'default' as const },
    lg: { button: 'h-14 w-14', icon: 'h-6 w-6', buttonSize: 'lg' as const }
  };

  const currentSize = sizeConfig[size];

  // Handle volume changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle voice navigation events
  useEffect(() => {
    if (voiceNav.error) {
      log.warn('VOICE_ASSISTANT', 'Voice navigation error', { error: voiceNav.error });
    }
  }, [voiceNav.error]);

  // Handle auto-reply config changes
  const handleAutoReplyConfigChange = (updates: Partial<AutoReplyConfig>) => {
    const newConfig = { ...voiceAutoReply.config, ...updates };
    onAutoReplyConfigChange?.(newConfig);
  };

  // Toggle voice assistant
  const handleToggle = () => {
    if (voiceNav.isListening) {
      voiceNav.stopListening();
    } else {
      voiceNav.startListening();
    }
  };

  // Speak help text
  const speakHelp = async () => {
    const helpText = `
      Voice commands you can use:
      - "Go home" - Navigate to home page
      - "Go to messages" - Open messages
      - "Go to events" - View events
      - "Go to profile" - View your profile
      - "Go to settings" - Open settings
      - "Search profiles" - Find new people
      - "Create event" - Make a new event
      - "Help" - Get help with commands
      - "Stop listening" - Turn off voice control
    `;

    await voiceNav.speak(helpText);
  };

  if (variant === 'floating') {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col gap-2">
          {/* Status indicator */}
          {(voiceNav.isListening || voiceNav.transcript) && (
            <div className="bg-background border rounded-lg p-3 shadow-lg min-w-[200px]">
              {voiceNav.isListening && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Listening...</span>
                </div>
              )}
              {voiceNav.transcript && (
                <div className="text-sm text-muted-foreground">
                  "{voiceNav.transcript}"
                </div>
              )}
              {voiceNav.feedback && (
                <div className="text-sm text-green-600 mt-1">
                  {voiceNav.feedback}
                </div>
              )}
            </div>
          )}

          {/* Main button */}
          <Button
            size={currentSize.buttonSize}
            onClick={handleToggle}
            disabled={!voiceNav.isSupported}
            className={cn(
              currentSize.button,
              "rounded-full shadow-lg transition-all duration-200",
              voiceNav.isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {voiceNav.isListening ? (
              <MicOff className={currentSize.icon} />
            ) : (
              <Mic className={currentSize.icon} />
            )}
          </Button>

          {/* Settings button */}
          {showSettings && (
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  size={currentSize.buttonSize}
                  variant="outline"
                  className={cn(currentSize.button, "rounded-full")}
                >
                  <Settings className={currentSize.icon} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <VoiceSettingsPanel
                  voiceNav={voiceNav}
                  voiceAutoReply={voiceAutoReply}
                  volume={volume}
                  isMuted={isMuted}
                  onVolumeChange={setVolume}
                  onMutedChange={setIsMuted}
                  onAutoReplyConfigChange={handleAutoReplyConfigChange}
                  onSpeakHelp={speakHelp}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Voice status */}
      <div className="flex items-center gap-2">
        {voiceNav.isListening && (
          <Badge variant="destructive" className="animate-pulse">
            Listening
          </Badge>
        )}
        {voiceNav.transcript && (
          <div className="text-sm text-muted-foreground max-w-[200px] truncate">
            "{voiceNav.transcript}"
          </div>
        )}
      </div>

      {/* Main controls */}
      <div className="flex items-center gap-1">
        <Button
          size={currentSize.buttonSize}
          onClick={handleToggle}
          disabled={!voiceNav.isSupported}
          variant={voiceNav.isListening ? "destructive" : "default"}
          className={cn(
            currentSize.button,
            "transition-all duration-200"
          )}
        >
          {voiceNav.isListening ? (
            <MicOff className={currentSize.icon} />
          ) : (
            <Mic className={currentSize.icon} />
          )}
        </Button>

        {/* Volume control */}
        <Button
          size={currentSize.buttonSize}
          variant="outline"
          onClick={() => setIsMuted(!isMuted)}
          className={currentSize.button}
        >
          {isMuted ? (
            <VolumeX className={currentSize.icon} />
          ) : (
            <Volume2 className={currentSize.icon} />
          )}
        </Button>

        {/* Help button */}
        {showSettings && (
          <Button
            size={currentSize.buttonSize}
            variant="outline"
            onClick={speakHelp}
            className={currentSize.button}
          >
            <HelpCircle className={currentSize.icon} />
          </Button>
        )}

        {/* Settings */}
        {showSettings && (
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                size={currentSize.buttonSize}
                variant="outline"
                className={currentSize.button}
              >
                <Settings className={currentSize.icon} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <VoiceSettingsPanel
                voiceNav={voiceNav}
                voiceAutoReply={voiceAutoReply}
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={setVolume}
                onMutedChange={setIsMuted}
                onAutoReplyConfigChange={handleAutoReplyConfigChange}
                onSpeakHelp={speakHelp}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

// Voice settings panel component
interface VoiceSettingsPanelProps {
  voiceNav: ReturnType<typeof useVoiceNavigation>;
  voiceAutoReply: ReturnType<typeof useVoiceAutoReply>;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
  onAutoReplyConfigChange: (updates: Partial<AutoReplyConfig>) => void;
  onSpeakHelp: () => Promise<void>;
}

const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  voiceNav,
  voiceAutoReply,
  volume,
  isMuted,
  onVolumeChange,
  onMutedChange,
  onAutoReplyConfigChange,
  onSpeakHelp
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Voice Settings</h3>
        <Badge variant={voiceNav.isSupported ? "default" : "destructive"}>
          {voiceNav.isSupported ? "Supported" : "Not Supported"}
        </Badge>
      </div>

      {/* Voice Control */}
      <div className="space-y-2">
        <Label>Voice Control</Label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {voiceNav.isListening ? "Active" : "Inactive"}
          </span>
          <Switch
            checked={voiceNav.isListening}
            onCheckedChange={(checked) => {
              if (checked) {
                voiceNav.startListening();
              } else {
                voiceNav.stopListening();
              }
            }}
          />
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <Label>Volume</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([value]) => onVolumeChange(value)}
            max={1}
            min={0}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-10">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* Auto-Reply Settings */}
      <div className="space-y-3">
        <Label>Auto-Reply Assistant</Label>

        <div className="flex items-center justify-between">
          <span className="text-sm">Enable Auto-Reply</span>
          <Switch
            checked={voiceAutoReply.config.enabled}
            onCheckedChange={(enabled) => onAutoReplyConfigChange({ enabled })}
          />
        </div>

        {voiceAutoReply.config.enabled && (
          <>
            <div className="space-y-1">
              <Label className="text-sm">Personality</Label>
              <Select
                value={voiceAutoReply.config.personality}
                onValueChange={(personality) =>
                  onAutoReplyConfigChange({ personality: personality as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="flirty">Flirty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Response Length</Label>
              <Select
                value={voiceAutoReply.config.responseLength}
                onValueChange={(responseLength) =>
                  onAutoReplyConfigChange({ responseLength: responseLength as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-Send High Confidence</span>
              <Switch
                checked={voiceAutoReply.config.autoSend}
                onCheckedChange={(autoSend) => onAutoReplyConfigChange({ autoSend })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Confidence Threshold</Label>
              <Slider
                value={[voiceAutoReply.config.confidenceThreshold]}
                onValueChange={([threshold]) =>
                  onAutoReplyConfigChange({ confidenceThreshold: threshold })
                }
                max={1}
                min={0.5}
                step={0.1}
              />
              <span className="text-xs text-muted-foreground">
                {Math.round(voiceAutoReply.config.confidenceThreshold * 100)}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* Help */}
      <div className="pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onSpeakHelp}
          className="w-full"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Speak Help
        </Button>
      </div>

      {/* Status */}
      {voiceNav.error && (
        <div className="text-sm text-destructive">
          Error: {voiceNav.error}
        </div>
      )}
    </div>
  );
};