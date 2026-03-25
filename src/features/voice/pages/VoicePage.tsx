import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Brain, Download, MessageCircle, Mic, MicOff, Pause, Play, Share2, Volume2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Slider} from '@/components/ui/slider';

interface VoiceCommand {
  id: string;
  command: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface VoiceRecording {
  id: string;
  title: string;
  duration: number;
  transcript: string;
  createdAt: string;
  isPublic: boolean;
  plays: number;
}

interface VoiceSetting {
  id: string;
  name: string;
  description: string;
  value: boolean | number | string;
  type: 'toggle' | 'slider' | 'select';
}

export default function VoicePage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [settings, setSettings] = useState<VoiceSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading voice data
    setTimeout(() => {
      setRecordings([
        {
          id: '1',
          title: 'Voice Introduction',
          duration: 30,
          transcript: 'Hi, I\'m Alex and I love outdoor adventures and trying new restaurants...',
          createdAt: '2024-01-15',
          isPublic: true,
          plays: 45
        },
        {
          id: '2',
          title: 'About My Hobbies',
          duration: 45,
          transcript: 'In my free time, I enjoy hiking, photography, and cooking...',
          createdAt: '2024-01-12',
          isPublic: false,
          plays: 12
        }
      ]);

      setCommands([
        {
          id: '1',
          command: 'Show me matches',
          description: 'Navigate to the matches grid',
          category: 'Navigation',
          enabled: true
        },
        {
          id: '2',
          command: 'Open messages',
          description: 'Go to messages page',
          category: 'Navigation',
          enabled: true
        },
        {
          id: '3',
          command: 'Start voice chat',
          description: 'Initiate voice conversation',
          category: 'Communication',
          enabled: true
        }
      ]);

      setSettings([
        {
          id: '1',
          name: 'Voice Activation',
          description: 'Enable voice commands',
          value: true,
          type: 'toggle'
        },
        {
          id: '2',
          name: 'Recording Quality',
          description: 'Set audio recording quality',
          value: 70,
          type: 'slider'
        },
        {
          id: '3',
          name: 'Voice Language',
          description: 'Select voice recognition language',
          value: 'en-US',
          type: 'select'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayRecording = (recordingId: string) => {
    setIsPlaying(!isPlaying);
    // In a real app, this would play the recording
  };

  const handleToggleCommand = (commandId: string) => {
    setCommands(prev => prev.map(cmd => 
      cmd.id === commandId ? { ...cmd, enabled: !cmd.enabled } : cmd
    ));
  };

  const handleUpdateSetting = (settingId: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading voice features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Features</h1>
          <p className="text-muted-foreground">Control the app with your voice and create audio content</p>
        </div>

        {/* Voice Recorder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-6 h-6" />
              Voice Recorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {/* Recording Button */}
              <div className="relative">
                <Button
                  size="lg"
                  className={`w-24 h-24 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping" />
                )}
              </div>

              {/* Recording Time */}
              {isRecording && (
                <div className="text-center">
                  <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
                  <div className="text-sm text-muted-foreground">Recording...</div>
                </div>
              )}

              {/* Volume Control */}
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Volume</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="recordings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="commands">Voice Commands</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="ai">AI Voice</TabsTrigger>
          </TabsList>

          <TabsContent value="recordings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Recordings</CardTitle>
              </CardHeader>
              <CardContent>
                {recordings.length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recordings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recordings.map((recording) => (
                      <div key={recording.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlayRecording(recording.id)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <div className="flex-1">
                          <div className="font-medium">{recording.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(recording.duration)} • {recording.plays} plays
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {recording.transcript}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Badge variant={recording.isPublic ? 'default' : 'secondary'}>
                            {recording.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commands" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commands.map((command) => (
                    <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{command.command}</div>
                        <div className="text-sm text-muted-foreground">{command.description}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {command.category}
                        </Badge>
                      </div>
                      <Button
                        variant={command.enabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleCommand(command.id)}
                      >
                        {command.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{setting.name}</div>
                        <div className="text-sm text-muted-foreground">{setting.description}</div>
                      </div>
                      <div>
                        {setting.type === 'toggle' && (
                          <Button
                            variant={setting.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleUpdateSetting(setting.id, !setting.value)}
                          >
                            {setting.value ? 'On' : 'Off'}
                          </Button>
                        )}
                        {setting.type === 'slider' && (
                          <Slider
                            value={[setting.value as number]}
                            onValueChange={(value) => handleUpdateSetting(setting.id, value[0])}
                            max={100}
                            step={1}
                            className="w-24"
                          />
                        )}
                        {setting.type === 'select' && (
                          <select
                            value={setting.value as string}
                            onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                            className="px-3 py-1 border rounded text-sm"
                          >
                            <option value="en-US">English</option>
                            <option value="es-ES">Spanish</option>
                            <option value="fr-FR">French</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI Voice Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">AI Voice Features</h3>
                    <p className="text-muted-foreground mb-4">
                      Get AI-powered voice assistance for dating conversations
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Conversation Coach</h4>
                        <p className="text-sm text-muted-foreground">
                          Get real-time voice coaching for better conversations
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Voice Messages</h4>
                        <p className="text-sm text-muted-foreground">
                          Send and receive AI-enhanced voice messages
                        </p>
                      </div>
                    </div>
                    <Button className="mt-4">
                      <Brain className="w-4 h-4 mr-2" />
                      Try AI Voice Assistant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
