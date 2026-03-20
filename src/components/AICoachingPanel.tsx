/**
 * Enterprise AI Coaching Panel Component
 * Advanced AI-powered dating coach with personalized recommendations and analysis
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  MessageCircle,
  TrendingUp,
  Target,
  Users,
  Heart,
  Star,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Eye,
  Shield,
  Award,
  Compass,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Info,
  HelpCircle,
  Sparkles,
  Rocket,
  Trophy,
  Flag,
  RefreshCw,
  Sliders,
  Gauge,
  Target as TargetIcon,
} from 'lucide-react';

import { UserProfile } from '@/lib/hybrid-p2p-dating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AICoachingPanelProps {
  profile: UserProfile | null;
  onAnalyzeCompatibility: (user: UserProfile) => void;
  onGetRecommendations: () => Promise<UserProfile[]>;
}

interface AIInsight {
  id: string;
  type: 'strength' | 'improvement' | 'opportunity' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'profile' | 'messaging' | 'behavior' | 'compatibility' | 'safety';
  timestamp: Date;
  implemented?: boolean;
}

interface CompatibilityAnalysis {
  overallScore: number;
  factors: {
    interests: number;
    values: number;
    lifestyle: number;
    communication: number;
    physical: number;
    emotional: number;
    intellectual: number;
    social: number;
  };
  insights: string[];
  recommendations: string[];
  potentialMatches: UserProfile[];
}

interface CoachingSession {
  id: string;
  date: Date;
  type: 'profile_review' | 'compatibility_analysis' | 'messaging_coaching' | 'behavior_analysis';
  insights: AIInsight[];
  score: number;
  improvements: number;
  nextSteps: string[];
}

interface PerformanceMetrics {
  profileViews: number;
  matches: number;
  messages: number;
  responseRate: number;
  averageResponseTime: number;
  profileCompleteness: number;
  photoQuality: number;
  bioEngagement: number;
  overallScore: number;
}

export default function AICoachingPanel({
  profile,
  onAnalyzeCompatibility,
  onGetRecommendations,
}: AICoachingPanelProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'compatibility' | 'performance' | 'coaching'>('insights');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [compatibilityAnalysis, setCompatibilityAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [showInsightDetails, setShowInsightDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Sample data (would come from actual AI service)
  useEffect(() => {
    if (profile) {
      generateInitialData();
    }
  }, [profile]);

  const generateInitialData = useCallback(() => {
    // Generate sample insights
    const sampleInsights: AIInsight[] = [
      {
        id: '1',
        type: 'strength',
        title: 'Excellent Photo Quality',
        description: 'Your photos are high-quality and show variety, which increases profile engagement by 45%',
        actionable: false,
        priority: 'low',
        category: 'profile',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        implemented: true,
      },
      {
        id: '2',
        type: 'improvement',
        title: 'Bio Could Be More Detailed',
        description: 'Adding specific interests and hobbies could improve match quality by 30%',
        actionable: true,
        priority: 'medium',
        category: 'profile',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Optimal Messaging Time',
        description: 'Your response rate is highest between 7-9 PM. Focus on messaging during this window',
        actionable: true,
        priority: 'medium',
        category: 'behavior',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
      {
        id: '4',
        type: 'warning',
        title: 'Low Response Rate',
        description: 'Your response rate is 23% below average. Consider improving your opening messages',
        actionable: true,
        priority: 'high',
        category: 'messaging',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
    ];

    setInsights(sampleInsights);

    // Generate sample compatibility analysis
    setCompatibilityAnalysis({
      overallScore: 0.78,
      factors: {
        interests: 0.82,
        values: 0.91,
        lifestyle: 0.76,
        communication: 0.89,
        physical: 0.73,
        emotional: 0.81,
        intellectual: 0.85,
        social: 0.77,
      },
      insights: [
        'Strong alignment in values and communication styles',
        'Complementary interests that could enrich both partners',
        'Similar lifestyle preferences reduce potential conflicts',
      ],
      recommendations: [
        'Focus on partners with high emotional intelligence',
        'Look for shared long-term goals',
        'Consider partners with similar social energy levels',
      ],
      potentialMatches: [],
    });

    // Generate sample performance metrics
    setPerformanceMetrics({
      profileViews: 145,
      matches: 23,
      messages: 67,
      responseRate: 0.67,
      averageResponseTime: 2.3,
      profileCompleteness: 0.85,
      photoQuality: 0.92,
      bioEngagement: 0.78,
      overallScore: 0.81,
    });

    // Generate sample coaching sessions
    setCoachingSessions([
      {
        id: '1',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24),
        type: 'profile_review',
        insights: sampleInsights.slice(0, 2),
        score: 0.75,
        improvements: 3,
        nextSteps: ['Update bio with specific interests', 'Add more variety to photos'],
      },
      {
        id: '2',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48),
        type: 'compatibility_analysis',
        insights: sampleInsights.slice(2, 4),
        score: 0.68,
        improvements: 2,
        nextSteps: ['Improve response rate', 'Optimize messaging timing'],
      },
    ]);
  }, []);

  const runAIAnalysis = useCallback(async () => {
    if (!profile) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate new insights
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'opportunity',
        title: 'New Trend Detected',
        description: 'Users with similar profiles are getting 25% more matches by highlighting travel experiences',
        actionable: true,
        priority: 'medium',
        category: 'profile',
        timestamp: new Date(),
      };
      
      setInsights(prev => [newInsight, ...prev]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile]);

  const implementInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, implemented: true } : insight
    ));
  }, []);

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      if (filterCategory !== 'all' && insight.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return insight.title.toLowerCase().includes(query) || 
               insight.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [insights, filterCategory, searchQuery]);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('AI Report generated');
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);

  const InsightsTab = () => (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card className="bg-black/40 border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
          <Button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              type="text"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border-white/20 rounded-lg text-white"
          >
            <option value="all">All Categories</option>
            <option value="profile">Profile</option>
            <option value="messaging">Messaging</option>
            <option value="behavior">Behavior</option>
            <option value="compatibility">Compatibility</option>
            <option value="safety">Safety</option>
          </select>
        </div>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border-white/20 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  insight.type === 'strength' ? 'bg-green-500/20 text-green-400' :
                  insight.type === 'improvement' ? 'bg-yellow-500/20 text-yellow-400' :
                  insight.type === 'opportunity' ? 'bg-blue-500/20 text-blue-400' :
                  insight.type === 'warning' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {
                    insight.type === 'strength' ? <CheckCircle className="w-5 h-5" /> :
                    insight.type === 'improvement' ? <TrendingUp className="w-5 h-5" /> :
                    insight.type === 'opportunity' ? <Lightbulb className="w-5 h-5" /> :
                    insight.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                    <Info className="w-5 h-5" />
                  }
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    <Badge className={`text-xs ${
                      insight.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      insight.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.priority}
                    </Badge>
                    <Badge className="bg-white/10 text-white text-xs">
                      {insight.category}
                    </Badge>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-2">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">
                      {insight.timestamp.toLocaleDateString()} at {insight.timestamp.toLocaleTimeString()}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {insight.actionable && !insight.implemented && (
                        <Button
                          onClick={() => implementInsight(insight.id)}
                          size="sm"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Implement
                        </Button>
                      )}
                      
                      {insight.implemented && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Implemented
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInsight(insight);
                          setShowInsightDetails(true);
                        }}
                        className="text-white/60 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const CompatibilityTab = () => (
    <div className="space-y-6">
      {compatibilityAnalysis && (
        <>
          {/* Overall Score */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compatibility Analysis</h3>
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-white/10">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + compatibilityAnalysis.overallScore * 50}% 0%, ${50 + compatibilityAnalysis.overallScore * 50}% 100%, 50% 100%)`
                    }}
                  />
                </div>
                <div className="absolute text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(compatibilityAnalysis.overallScore * 100)}%
                  </div>
                  <div className="text-white/60 text-sm">Overall Score</div>
                </div>
              </div>
            </div>
            
            {/* Factor Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(compatibilityAnalysis.factors).map(([key, value], index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{Math.round(value * 100)}%</div>
                  <div className="text-white/60 text-sm capitalize">{key}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Insights */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
            <div className="space-y-3">
              {compatibilityAnalysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <p className="text-white/80">{insight}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
            <div className="space-y-3">
              {compatibilityAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                  <p className="text-white/80">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      {performanceMetrics && (
        <>
          {/* Overall Performance */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{performanceMetrics.profileViews}</div>
                <div className="text-white/60 text-sm">Profile Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{performanceMetrics.matches}</div>
                <div className="text-white/60 text-sm">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{Math.round(performanceMetrics.responseRate * 100)}%</div>
                <div className="text-white/60 text-sm">Response Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{performanceMetrics.messages}</div>
                <div className="text-white/60 text-sm">Messages</div>
              </div>
            </div>
          </Card>

          {/* Quality Metrics */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quality Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Profile Completeness', value: performanceMetrics.profileCompleteness, icon: Users },
                { label: 'Photo Quality', value: performanceMetrics.photoQuality, icon: Eye },
                { label: 'Bio Engagement', value: performanceMetrics.bioEngagement, icon: MessageCircle },
                { label: 'Overall Score', value: performanceMetrics.overallScore, icon: Trophy },
              ].map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">{metric.label}</span>
                    <span className="text-white">{Math.round(metric.value * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${metric.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Coaching History */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Coaching History</h3>
            <div className="space-y-4">
              {coachingSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium capitalize">{session.type.replace('_', ' ')}</div>
                    <div className="text-white/60 text-sm">{session.date.toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{Math.round(session.score * 100)}%</div>
                    <div className="text-white/60 text-sm">{session.improvements} improvements</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const CoachingTab = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Coaching Sessions</h3>
        <div className="text-center py-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h4 className="text-xl font-semibold text-white mb-2">Personalized AI Coaching</h4>
          <p className="text-white/60 mb-6">
            Get personalized advice and insights to improve your dating experience
          </p>
          <Button
            onClick={() => onAnalyzeCompatibility(profile!)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Coaching Session
          </Button>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Generate Report</h3>
        <p className="text-white/60 mb-4">
          Get a comprehensive AI analysis report with actionable insights
        </p>
        <Button
          onClick={generateReport}
          disabled={isGeneratingReport}
          className="bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingReport ? 'Generating...' : 'Generate Report'}
        </Button>
      </Card>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'insights':
        return <InsightsTab />;
      case 'compatibility':
        return <CompatibilityTab />;
      case 'performance':
        return <PerformanceTab />;
      case 'coaching':
        return <CoachingTab />;
      default:
        return <InsightsTab />;
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <Brain className="w-16 h-16 mx-auto mb-4 text-white/60" />
          <h3 className="text-xl font-semibold mb-2">AI Coaching</h3>
          <p className="text-white/60">Profile information is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-black/20">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-400" />
          <span>AI Coach</span>
        </h2>
        <nav className="space-y-2">
          {[
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'compatibility', label: 'Compatibility', icon: Users },
            { id: 'performance', label: 'Performance', icon: BarChart3 },
            { id: 'coaching', label: 'Coaching', icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-white/60">AI-powered insights and recommendations</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={runAIAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {renderTab()}
          </div>
        </div>
      </div>

      {/* Insight Details Modal */}
      <AnimatePresence>
        {showInsightDetails && selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowInsightDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{selectedInsight.title}</h3>
                <Button
                  onClick={() => setShowInsightDetails(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className={`${
                    selectedInsight.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    selectedInsight.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    selectedInsight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedInsight.priority} priority
                  </Badge>
                  <Badge className="bg-white/10 text-white">
                    {selectedInsight.category}
                  </Badge>
                  <Badge className={`${
                    selectedInsight.type === 'strength' ? 'bg-green-500/20 text-green-400' :
                    selectedInsight.type === 'improvement' ? 'bg-yellow-500/20 text-yellow-400' :
                    selectedInsight.type === 'opportunity' ? 'bg-blue-500/20 text-blue-400' :
                    selectedInsight.type === 'warning' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedInsight.type}
                  </Badge>
                </div>
                
                <p className="text-white/80 leading-relaxed">{selectedInsight.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-white/60 text-sm">
                    {selectedInsight.timestamp.toLocaleDateString()} at {selectedInsight.timestamp.toLocaleTimeString()}
                  </span>
                  
                  {selectedInsight.actionable && !selectedInsight.implemented && (
                    <Button
                      onClick={() => {
                        implementInsight(selectedInsight.id);
                        setShowInsightDetails(false);
                      }}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Implement Insight
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
