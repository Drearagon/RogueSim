import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, TrendingUp, AlertTriangle, Eye, Lock, Zap } from 'lucide-react';

interface SecurityStats {
  suspiciousIPs: string[];
  rateLimitEntries: number;
  honeypotHits: number;
}

interface GameAnalytics {
  totalUsers: number;
  activeUsers: number;
  completedMissions: number;
  averageSessionTime: number;
  popularCommands: string[];
  missionCompletionRates: Record<string, number>;
  timestamp: string;
}

interface AuditLog {
  timestamp: Date;
  ip: string;
  action: string;
  userId?: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [gameAnalytics, setGameAnalytics] = useState<GameAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'security' | 'analytics' | 'logs'>('security');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [securityRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/security-stats'),
        fetch('/api/admin/game-analytics')
      ]);

      if (securityRes.ok) {
        const securityData = await securityRes.json();
        setSecurityStats(securityData.security);
        setAuditLogs(securityData.recentLogs);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setGameAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-lg border border-green-500">
          <div className="animate-pulse text-green-400">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-900/20 p-6 border-b border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-400">RogueSim Admin Dashboard</h2>
            </div>
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-300 font-bold text-xl"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            {[
              { id: 'security', label: 'Security Monitor', icon: Lock },
              { id: 'analytics', label: 'Game Analytics', icon: TrendingUp },
              { id: 'logs', label: 'Audit Logs', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  activeTab === id
                    ? 'bg-green-600 text-white border-green-500'
                    : 'text-green-400 border-green-700 hover:bg-green-900/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Overview
              </h3>

              {securityStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Suspicious IPs</p>
                        <p className="text-2xl font-bold text-red-400">{securityStats.suspiciousIPs?.length || 0}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Rate Limit Entries</p>
                        <p className="text-2xl font-bold text-yellow-400">{securityStats.rateLimitEntries}</p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Honeypot Hits</p>
                        <p className="text-2xl font-bold text-orange-400">{securityStats.honeypotHits}</p>
                      </div>
                      <Shield className="w-8 h-8 text-orange-400" />
                    </div>
                  </div>
                </div>
              )}

              {securityStats?.suspiciousIPs && securityStats.suspiciousIPs.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg border border-red-500">
                  <h4 className="text-red-400 font-semibold mb-3">Flagged IP Addresses</h4>
                  <div className="space-y-2">
                    {securityStats.suspiciousIPs.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-900/20 rounded">
                        <span className="text-red-300 font-mono">{ip}</span>
                        <span className="text-red-400 text-sm">Suspicious Activity Detected</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Game Analytics
              </h3>

              {gameAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-2xl font-bold text-green-400">{gameAnalytics.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Users</p>
                        <p className="text-2xl font-bold text-blue-400">{gameAnalytics.activeUsers}</p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Missions Completed</p>
                        <p className="text-2xl font-bold text-purple-400">{gameAnalytics.completedMissions}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Avg Session (min)</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {Math.round(gameAnalytics.averageSessionTime / 60)}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-800 p-4 rounded-lg border border-green-700">
                <h4 className="text-green-400 font-semibold mb-3">Popular Commands</h4>
                <div className="space-y-2">
                  {gameAnalytics?.popularCommands.slice(0, 10).map((command, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-green-300 font-mono">{command}</span>
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No data available</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Security Audit Logs
              </h3>

              <div className="bg-gray-800 rounded-lg border border-green-700 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {auditLogs.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-700 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-green-400">Timestamp</th>
                          <th className="text-left p-3 text-green-400">IP Address</th>
                          <th className="text-left p-3 text-green-400">Action</th>
                          <th className="text-left p-3 text-green-400">Severity</th>
                          <th className="text-left p-3 text-green-400">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log, index) => (
                          <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                            <td className="p-3 text-gray-300 text-sm font-mono">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="p-3 text-gray-300 font-mono">{log.ip}</td>
                            <td className="p-3 text-gray-300">{log.action}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(log.severity)}`}>
                                {log.severity.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-gray-400 text-sm max-w-xs truncate">
                              {JSON.stringify(log.details)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No audit logs available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}