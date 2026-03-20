/**
 * Enterprise Analytics Dashboard Component
 * Real-time analytics with AI insights and performance monitoring
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  MessageCircle,
  Heart,
  Eye,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Zap,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Share2,
  Monitor,
  Smartphone,
  Globe,
  Wifi,
  Database,
  Shield,
  Brain,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Calendar as CalendarIcon,
  User,
  Star,
  Trophy,
  Flag,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsDashboardProps {
  performanceMetrics: {
    connectionQuality: number;
    messageLatency: number;
    encryptionSpeed: number;
  };
  compatibilityScores: Map<string, number>;
  activeConnections: number;
}

interface MetricData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  previousValue: number;
}

interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label: string;
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  userRetention: number;
  averageSessionDuration: number;
  bounceRate: number;
}

interface MessageAnalytics {
  totalMessages: number;
  messagesPerUser: number;
  averageResponseTime: number;
  responseRate: number;
  mostActiveHour: number;
  messageTypes: {
    text: number;
    image: number;
    video: number;
    audio: number;
  };
}

interface PerformanceAnalytics {
  averageLoadTime: number;
  uptime: number;
  errorRate: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface EngagementAnalytics {
  profileViews: number;
  likes: number;
  matches: number;
  swipeRightRate: number;
  swipeLeftRate: number;
  superLikeRate: number;
  boostUsage: number;
}

export default function AnalyticsDashboard({
  performanceMetrics,
  compatibilityScores,
  activeConnections,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Sample analytics data (would come from actual analytics service)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    totalUsers: 15420,
    activeUsers: 3847,
    newUsers: 234,
    returningUsers: 3613,
    userRetention: 0.78,
    averageSessionDuration: 12.5,
    bounceRate: 0.23,
  });

  const [messageAnalytics, setMessageAnalytics] = useState<MessageAnalytics>({
    totalMessages: 45678,
    messagesPerUser: 11.9,
    averageResponseTime: 2.3,
    responseRate: 0.67,
    mostActiveHour: 20,
    messageTypes: {
      text: 34234,
      image: 8901,
      video: 1234,
      audio: 1309,
    },
  });

  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics>({
    averageLoadTime: 1.2,
    uptime: 0.998,
    errorRate: 0.001,
    apiResponseTime: 145,
    databaseQueryTime: 23,
    cacheHitRate: 0.87,
    memoryUsage: 0.65,
    cpuUsage: 0.42,
  });

  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics>({
    profileViews: 89345,
    likes: 12456,
    matches: 3456,
    swipeRightRate: 0.34,
    swipeLeftRate: 0.66,
    superLikeRate: 0.08,
    boostUsage: 567,
  });

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  // Generate time series data
  useEffect(() => {
    const generateTimeSeriesData = () => {
      const now = new Date();
      const data: TimeSeriesData[] = [];
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160;
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          timestamp,
          value: Math.floor(Math.random() * 1000) + 500,
          label: timestamp.toLocaleDateString(),
        });
      }
      
      setTimeSeriesData(data);
    };

    generateTimeSeriesData();
  }, [timeRange]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with new data
      setUserAnalytics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 100) - 50,
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const exportData = useCallback(async () => {
    setExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Analytics data exported');
    } finally {
      setExporting(false);
    }
  }, []);

  const calculateMetricChange = useCallback((current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      isPositive: change > 0,
    };
  }, []);

  const MetricCard = ({ 
    title, 
    value, 
    previousValue, 
    icon: Icon, 
    color = 'blue',
    format = 'number',
    description,
  }: {
    title: string;
    value: number;
    previousValue: number;
    icon: any;
    color?: string;
    format?: 'number' | 'percentage' | 'time' | 'currency';
    description?: string;
  }) => {
    const change = calculateMetricChange(value, previousValue);
    
    const formatValue = (val: number) => {
      switch (format) {
        case 'percentage':
          return `${Math.round(val * 100)}%`;
        case 'time':
          return `${val.toFixed(1)}s`;
        case 'currency':
          return `$${val.toLocaleString()}`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-black/40 border-white/20 rounded-lg p-6 cursor-pointer"
        onClick={() => setSelectedMetric(title)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-full bg-${color}-500/20 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div className={`flex items-center space-x-1 ${
            change.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {change.trend === 'up' && <ArrowUp className="w-4 h-4" />}
            {change.trend === 'down' && <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {Math.abs(change.value).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-white">{formatValue(value)}</div>
          <div className="text-white/60 text-sm">{title}</div>
          {description && (
            <div className="text-white/40 text-xs mt-1">{description}</div>
          )}
        </div>
      </motion.div>
    );
  };

  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Users"
          value={userAnalytics.activeUsers}
          previousValue={userAnalytics.activeUsers - 234}
          icon={Users}
          color="blue"
          description="Currently online"
        />
        
        <MetricCard
          title="Messages Sent"
          value={messageAnalytics.totalMessages}
          previousValue={messageAnalytics.totalMessages - 1234}
          icon={MessageCircle}
          color="green"
          description="Last 24 hours"
        />
        
        <MetricCard
          title="Matches Made"
          value={engagementAnalytics.matches}
          previousValue={engagementAnalytics.matches - 156}
          icon={Heart}
          color="pink"
          description="Total connections"
        />
        
        <MetricCard
          title="Response Rate"
          value={messageAnalytics.responseRate}
          previousValue={messageAnalytics.responseRate - 0.02}
          icon={Activity}
          color="purple"
          format="percentage"
          description="Average response"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Load Time"
          value={performanceAnalytics.averageLoadTime}
          previousValue={performanceAnalytics.averageLoadTime + 0.2}
          icon={Monitor}
          color="orange"
          format="time"
          description="Page load"
        />
        
        <MetricCard
          title="Uptime"
          value={performanceAnalytics.uptime}
          previousValue={performanceAnalytics.uptime - 0.001}
          icon={Shield}
          color="green"
          format="percentage"
          description="Server availability"
        />
        
        <MetricCard
          title="Error Rate"
          value={performanceAnalytics.errorRate}
          previousValue={performanceAnalytics.errorRate + 0.0002}
          icon={AlertTriangle}
          color="red"
          format="percentage"
          description="System errors"
        />
      </div>
    </div>
  );

  const UserAnalyticsSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{userAnalytics.totalUsers.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{userAnalytics.activeUsers.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{userAnalytics.newUsers}</div>
            <div className="text-white/60 text-sm">New Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{Math.round(userAnalytics.userRetention * 100)}%</div>
            <div className="text-white/60 text-sm">Retention Rate</div>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Behavior</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Session Duration</span>
              <span className="text-white">{userAnalytics.averageSessionDuration.toFixed(1)} min</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(userAnalytics.averageSessionDuration / 30) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Bounce Rate</span>
              <span className="text-white">{Math.round(userAnalytics.bounceRate * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${userAnalytics.bounceRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const MessageAnalyticsSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Message Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{messageAnalytics.totalMessages.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Total Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{messageAnalytics.messagesPerUser.toFixed(1)}</div>
            <div className="text-white/60 text-sm">Messages per User</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{messageAnalytics.averageResponseTime.toFixed(1)}s</div>
            <div className="text-white/60 text-sm">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{Math.round(messageAnalytics.responseRate * 100)}%</div>
            <div className="text-white/60 text-sm">Response Rate</div>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Message Types</h3>
        
        <div className="space-y-3">
          {Object.entries(messageAnalytics.messageTypes).map(([type, count], index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-white capitalize">{type}</span>
                <span className="text-white">{count.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${(count / messageAnalytics.totalMessages) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const PerformanceAnalyticsSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{performanceAnalytics.averageLoadTime.toFixed(1)}s</div>
            <div className="text-white/60 text-sm">Avg Load Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{Math.round(performanceAnalytics.uptime * 100)}%</div>
            <div className="text-white/60 text-sm">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{(performanceAnalytics.errorRate * 100).toFixed(2)}%</div>
            <div className="text-white/60 text-sm">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{performanceAnalytics.apiResponseTime}ms</div>
            <div className="text-white/60 text-sm">API Response</div>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Memory Usage</span>
              <span className="text-white">{Math.round(performanceAnalytics.memoryUsage * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${performanceAnalytics.memoryUsage * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">CPU Usage</span>
              <span className="text-white">{Math.round(performanceAnalytics.cpuUsage * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${performanceAnalytics.cpuUsage * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Cache Hit Rate</span>
              <span className="text-white">{Math.round(performanceAnalytics.cacheHitRate * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${performanceAnalytics.cacheHitRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const EngagementAnalyticsSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{engagementAnalytics.profileViews.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Profile Views</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{engagementAnalytics.likes.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{engagementAnalytics.matches.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{engagementAnalytics.boostUsage}</div>
            <div className="text-white/60 text-sm">Boost Usage</div>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Swipe Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Swipe Right Rate</span>
              <span className="text-white">{Math.round(engagementAnalytics.swipeRightRate * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${engagementAnalytics.swipeRightRate * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Swipe Left Rate</span>
              <span className="text-white">{Math.round(engagementAnalytics.swipeLeftRate * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${engagementAnalytics.swipeLeftRate * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/60">Super Like Rate</span>
              <span className="text-white">{Math.round(engagementAnalytics.superLikeRate * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${engagementAnalytics.superLikeRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-full flex bg-black/20">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <span>Analytics</span>
        </h2>
        
        <div className="space-y-4">
          {/* Time Range Selector */}
          <div>
            <label className="text-white/60 text-sm block mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Auto Refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={refreshData}
              disabled={refreshing}
              className="w-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              onClick={exportData}
              disabled={exporting}
              className="w-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-white/60">Real-time performance and user engagement metrics</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                <Wifi className="w-3 h-3 mr-1" />
                {activeConnections} connections
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <OverviewSection />
            <UserAnalyticsSection />
            <MessageAnalyticsSection />
            <PerformanceAnalyticsSection />
            <EngagementAnalyticsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
