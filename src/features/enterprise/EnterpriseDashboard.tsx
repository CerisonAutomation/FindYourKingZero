/**
 * Enterprise Dashboard
 * Production-ready admin interface with comprehensive analytics and management
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  MessageSquare,
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  Database,
  Cpu,
  Wifi,
  Settings,
  Download,
  RefreshCw,
  Eye,
  Target,
  Brain,
  Heart,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

// ── INTERFACES ────────────────────────────────────────────────────────
interface EnterpriseMetrics {
  users: {
    total: number;
    active: number;
    new: number;
    premium: number;
    retention: number;
  };
  engagement: {
    messages: number;
    matches: number;
    likes: number;
    sessions: number;
    avgSessionDuration: number;
  };
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    costSavings: number;
  };
  revenue: {
    total: number;
    subscriptions: number;
    inAppPurchases: number;
    growth: number;
  };
  security: {
    threatsBlocked: number;
    reports: number;
    verifications: number;
    compliance: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

// ── COMPONENTS ────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.FC<any>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, change, icon: Icon, color, trend }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && getTrendIcon()}
      </div>
      <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {change !== undefined && (
        <p className={`text-sm mt-2 ${
          change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </p>
      )}
    </motion.div>
  );
};

const AlertPanel: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'info': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white/60">All systems operational</p>
        </div>
      ) : (
        alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{alert.title}</h4>
                <p className="text-sm opacity-80">{alert.message}</p>
                <p className="text-xs mt-2 opacity-60">
                  {alert.timestamp.toLocaleString()}
                </p>
              </div>
              {!alert.resolved && (
                <button className="ml-4 px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
                  Resolve
                </button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

const ServiceHealthPanel: React.FC<{ services: ServiceHealth[] }> = ({ services }) => {
  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
    }
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <X className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">Service Health</h3>
      {services.map(service => (
        <motion.div
          key={service.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={getStatusColor(service.status)}>
                {getStatusIcon(service.status)}
              </div>
              <h4 className="font-medium text-white">{service.name}</h4>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
              {service.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white/60">Uptime</p>
              <p className="font-medium text-white">{service.uptime}%</p>
            </div>
            <div>
              <p className="text-white/60">Response Time</p>
              <p className="font-medium text-white">{service.responseTime}ms</p>
            </div>
            <div>
              <p className="text-white/60">Error Rate</p>
              <p className="font-medium text-white">{service.errorRate}%</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────
export const EnterpriseDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data - in production, this would come from your enterprise services
  const metrics: EnterpriseMetrics = useMemo(() => ({
    users: {
      total: 125432,
      active: 89234,
      new: 1243,
      premium: 18432,
      retention: 87.3,
    },
    engagement: {
      messages: 1245678,
      matches: 45678,
      likes: 892345,
      sessions: 234567,
      avgSessionDuration: 12.5,
    },
    performance: {
      uptime: 99.97,
      responseTime: 142,
      errorRate: 0.12,
      throughput: 45678,
      costSavings: 34.7,
    },
    revenue: {
      total: 1245678,
      subscriptions: 892345,
      inAppPurchases: 353333,
      growth: 23.4,
    },
    security: {
      threatsBlocked: 45678,
      reports: 234,
      verifications: 8923,
      compliance: 99.8,
    },
  }), [selectedPeriod]);

  const alerts: Alert[] = useMemo(() => [
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Database server memory usage at 85%. Consider scaling.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      resolved: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for 2:00 AM UTC.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      resolved: false,
    },
  ], []);

  const services: ServiceHealth[] = useMemo(() => [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 89,
      errorRate: 0.01,
      lastCheck: new Date(),
    },
    {
      name: 'Database',
      status: 'degraded',
      uptime: 99.95,
      responseTime: 156,
      errorRate: 0.08,
      lastCheck: new Date(),
    },
    {
      name: 'P2P Network',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 45,
      errorRate: 0.02,
      lastCheck: new Date(),
    },
    {
      name: 'AI Services',
      status: 'healthy',
      uptime: 99.92,
      responseTime: 234,
      errorRate: 0.15,
      lastCheck: new Date(),
    },
  ], []);

  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date());
    // In production, this would trigger a data refresh
  }, []);

  const exportReport = useCallback(() => {
    // In production, this would generate and download a report
    console.log('Exporting enterprise report...');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Enterprise Dashboard</h1>
            <p className="text-white/60">Real-time system monitoring and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-white text-sm">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={exportReport}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {(['24h', '7d', '30d', '90d'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {period === '24h' ? 'Last 24 Hours' :
               period === '7d' ? 'Last 7 Days' :
               period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics.users.total.toLocaleString()}
            change={12.5}
            icon={Users}
            color="bg-blue-500"
            trend="up"
          />
          <MetricCard
            title="Revenue"
            value={`$${(metrics.revenue.total / 1000000).toFixed(1)}M`}
            change={metrics.revenue.growth}
            icon={DollarSign}
            color="bg-green-500"
            trend="up"
          />
          <MetricCard
            title="Uptime"
            value={`${metrics.performance.uptime}%`}
            change={-0.02}
            icon={Activity}
            color="bg-purple-500"
            trend="neutral"
          />
          <MetricCard
            title="Cost Savings"
            value={`${metrics.performance.costSavings}%`}
            change={5.8}
            icon={Zap}
            color="bg-yellow-500"
            trend="up"
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Metrics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">User Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Active Users</span>
                <span className="text-white font-medium">{metrics.users.active.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">New Users</span>
                <span className="text-white font-medium">{metrics.users.new.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Premium Users</span>
                <span className="text-white font-medium">{metrics.users.premium.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Retention Rate</span>
                <span className="text-white font-medium">{metrics.users.retention}%</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Response Time</span>
                <span className="text-white font-medium">{metrics.performance.responseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Error Rate</span>
                <span className="text-white font-medium">{metrics.performance.errorRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Throughput</span>
                <span className="text-white font-medium">{metrics.performance.throughput.toLocaleString()}/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">P2P Cost Savings</span>
                <span className="text-white font-medium">{metrics.performance.costSavings}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts and Service Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AlertPanel alerts={alerts} />
          <ServiceHealthPanel services={services} />
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
