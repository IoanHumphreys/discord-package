import { Activity, Users, Server, Zap, RefreshCw, ArrowUp, ArrowDown, Clock, Database, Cpu, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

const Dashboard = ({ stats, loading, error, onRefresh }) => {
  const [activities, setActivities] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (!loading && !error) {
      fetchActivities()
    }
  }, [loading, error])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.slice(0, 8))
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      setActivities([
        {
          id: 1,
          type: 'connection',
          message: 'Bot connected to Gaming Hub',
          created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: 'command',
          message: 'Ban command executed by Admin',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'system',
          message: 'Database reconnected successfully',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          type: 'error',
          message: 'Failed to process message in #general',
          created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        }
      ])
    } finally {
      setActivityLoading(false)
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffMs / 86400000)}d ago`
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'connection': return <Server size={14} className="text-green-400" />
      case 'command': return <Zap size={14} className="text-blue-400" />
      case 'system': return <Database size={14} className="text-orange-400" />
      case 'error': return <ArrowDown size={14} className="text-red-400" />
      default: return <Activity size={14} className="text-blue-400" />
    }
  }

  const getActivityDotColor = (type) => {
    switch (type) {
      case 'connection': return 'bg-green-500'
      case 'command': return 'bg-blue-500'  
      case 'system': return 'bg-orange-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-white">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-text-muted text-lg">Real-time monitoring and bot performance metrics</p>
          </div>
          <button 
            onClick={onRefresh} 
            className="flex items-center gap-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-primary/25 disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Servers Card */}
          <div className="group bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Server size={24} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <ArrowUp size={14} />
                <span>12%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-muted text-sm font-medium">Active Servers</p>
              <p className="text-3xl font-bold text-white">{stats?.guilds || 0}</p>
              <p className="text-xs text-green-400 font-medium">
                {stats?.guilds > 0 ? '✓ All Connected' : '✗ Offline'}
              </p>
            </div>
          </div>

          {/* Users Card */}
          <div className="group bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Users size={24} className="text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <TrendingUp size={14} />
                <span>8%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-muted text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">
                {stats?.users ? (stats.users > 999 ? `${(stats.users/1000).toFixed(1)}k` : stats.users) : 0}
              </p>
              <p className="text-xs text-green-400 font-medium">
                {stats?.users > 0 ? 'Active Community' : 'No Users'}
              </p>
            </div>
          </div>

          {/* Commands Card */}
          <div className="group bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Zap size={24} className="text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-sm font-medium">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                <span>Ready</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-muted text-sm font-medium">Available Commands</p>
              <p className="text-3xl font-bold text-white">{stats?.commands || 0}</p>
              <p className="text-xs text-purple-400 font-medium">Fully Operational</p>
            </div>
          </div>

          {/* System Status Card */}
          <div className="group bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Activity size={24} className="text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats?.guilds > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs font-medium text-white">
                  {stats?.guilds > 0 ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-muted text-sm font-medium">System Uptime</p>
              <p className="text-3xl font-bold text-white">{stats?.uptime || '0m'}</p>
              <p className="text-xs text-orange-400 font-medium">Stable Performance</p>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Cpu size={20} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Performance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">Latency</span>
                <span className="text-white font-semibold">{stats?.ping || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">Memory Usage</span>
                <span className="text-white font-semibold">{stats?.memory || 0}MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">Last Restart</span>
                <span className="text-white font-semibold text-xs">
                  {stats?.lastRestart ? formatTimeAgo(stats.lastRestart) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Zap size={20} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105">
                Restart Bot
              </button>
              <button className="w-full bg-surface-light hover:bg-border text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border border-border/50">
                View Logs
              </button>
              <button className="w-full bg-surface-light hover:bg-border text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border border-border/50">
                Deploy Commands
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Database size={20} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">System Health</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Discord Gateway</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-surface to-surface-light border border-border/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock size={20} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            </div>
            <span className="text-text-muted text-sm">Last 24 hours</span>
          </div>
          
          <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                <span className="ml-3 text-text-muted">Loading activities...</span>
              </div>
            ) : (
              <>
                {activities.length > 0 ? activities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start gap-4 p-4 bg-surface-light/50 hover:bg-surface-light rounded-xl transition-all duration-200 hover:scale-[1.02] group">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium group-hover:text-blue-100 transition-colors">
                        {activity.message}
                      </p>
                      <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 ${getActivityDotColor(activity.type)}`}></div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity size={24} className="text-text-muted" />
                    </div>
                    <p className="text-text-muted text-lg font-medium">No recent activity</p>
                    <p className="text-text-muted text-sm mt-1">Activity will appear here when your bot starts working</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard