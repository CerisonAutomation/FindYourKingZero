import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Brain, Heart, MessageCircle, Settings, Sparkles, Target, Zap} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Progress} from '@/components/ui/progress';

interface AIService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'premium';
  usage: number;
  maxUsage: number;
}

interface AIConversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  messages: number;
  isActive: boolean;
  type: 'coaching' | 'icebreaker' | 'profile' | 'compatibility';
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'profile' | 'conversation' | 'matching' | 'engagement';
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function AIPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<AIService[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate loading AI data
    setTimeout(() => {
      setServices([
        {
          id: '1',
          name: 'AI Dating Coach',
          description: 'Personalized dating advice and conversation coaching',
          icon: <MessageCircle className="w-5 h-5" />,
          status: 'active',
          usage: 45,
          maxUsage: 100
        },
        {
          id: '2',
          name: 'Profile Optimizer',
          description: 'AI-powered profile enhancement and photo selection',
          icon: <Heart className="w-5 h-5" />,
          status: 'active',
          usage: 23,
          maxUsage: 50
        },
        {
          id: '3',
          name: 'Compatibility Engine',
          description: 'Advanced matching algorithm with personality analysis',
          icon: <Target className="w-5 h-5" />,
          status: 'premium',
          usage: 67,
          maxUsage: 100
        },
        {
          id: '4',
          name: 'Icebreaker Generator',
          description: 'Smart conversation starters based on profiles',
          icon: <Sparkles className="w-5 h-5" />,
          status: 'active',
          usage: 12,
          maxUsage: 30
        }
      ]);

      setConversations([
        {
          id: '1',
          title: 'First Date Tips',
          preview: 'What are some good conversation topics for a first date?',
          createdAt: '2024-01-15',
          messages: 8,
          isActive: false,
          type: 'coaching'
        },
        {
          id: '2',
          title: 'Profile Review',
          preview: 'Can you help me improve my dating profile?',
          createdAt: '2024-01-14',
          messages: 12,
          isActive: false,
          type: 'profile'
        },
        {
          id: '3',
          title: 'Message Help',
          preview: 'How should I respond to this message?',
          createdAt: '2024-01-13',
          messages: 5,
          isActive: true,
          type: 'coaching'
        }
      ]);

      setInsights([
        {
          id: '1',
          title: 'Profile Photo Performance',
          description: 'Your second photo gets 3x more engagement than others',
          type: 'profile',
          impact: 'high',
          actionable: true
        },
        {
          id: '2',
          title: 'Conversation Patterns',
          description: 'You respond 40% faster to messages about hobbies',
          type: 'conversation',
          impact: 'medium',
          actionable: false
        },
        {
          id: '3',
          title: 'Match Quality',
          description: 'Your compatibility scores are highest with creative professionals',
          type: 'matching',
          impact: 'high',
          actionable: true
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleStartConversation = (type: AIConversation['type']) => {
    // In a real app, this would start a new AI conversation
    console.log(`Starting ${type} conversation`);
  };

  const handleViewInsight = (insightId: string) => {
    // In a real app, this would show detailed insight
    console.log(`Viewing insight ${insightId}`);
  };

  const getStatusColor = (status: AIService['status']) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'premium': return 'text-purple-600';
      default: return 'text-gray-400';
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Brain className="w-8 h-8 text-purple-600" />
                AI Assistant
              </h1>
              <p className="text-muted-foreground">Your intelligent dating companion</p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="lab">AI Lab</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStartConversation('coaching')}>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold">Dating Coach</h3>
                  <p className="text-sm text-muted-foreground">Get personalized advice</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStartConversation('profile')}>
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3 text-red-600" />
                  <h3 className="font-semibold">Profile Help</h3>
                  <p className="text-sm text-muted-foreground">Optimize your profile</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStartConversation('icebreaker')}>
                <CardContent className="p-6 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold">Icebreakers</h3>
                  <p className="text-sm text-muted-foreground">Smart conversation starters</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStartConversation('compatibility')}>
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold">Compatibility</h3>
                  <p className="text-sm text-muted-foreground">Analyze your matches</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversations.slice(0, 3).map((conversation) => (
                      <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{conversation.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {conversation.preview}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conversation.messages} messages • {new Date(conversation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {conversation.isActive && (
                          <Badge variant="default" className="ml-2">Active</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{insight.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {insight.description}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact}
                          </Badge>
                          {insight.actionable && (
                            <Button variant="outline" size="sm" onClick={() => handleViewInsight(insight.id)}>
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${getStatusColor(service.status)}`}>
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <Badge variant={service.status === 'premium' ? 'default' : 'secondary'} className="mt-1">
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usage</span>
                        <span>{service.usage}/{service.maxUsage}</span>
                      </div>
                      <Progress value={(service.usage / service.maxUsage) * 100} className="h-2" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" variant={service.status === 'active' ? 'default' : 'outline'}>
                        {service.status === 'active' ? 'Use Service' : 'Upgrade'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>AI Conversations</CardTitle>
                  <Button onClick={() => handleStartConversation('coaching')}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{conversation.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {conversation.type}
                          </Badge>
                          {conversation.isActive && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {conversation.preview}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {conversation.messages} messages • {new Date(conversation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline">Actionable</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewInsight(insight.id)}>
                          Learn More
                        </Button>
                        {insight.actionable && (
                          <Button size="sm">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  AI Lab - Experimental Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced AI features and experimental tools are being developed
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Voice AI</h4>
                      <p className="text-sm text-muted-foreground">
                        Voice-powered dating assistance
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Predictive Matching</h4>
                      <p className="text-sm text-muted-foreground">
                        AI that predicts your perfect match
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Social AI</h4>
                      <p className="text-sm text-muted-foreground">
                        Analyzes social patterns for better dating
                      </p>
                    </div>
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
