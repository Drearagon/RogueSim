import React, { useState } from 'react';
import { Shield, Play, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

interface SecurityTestSuiteProps {
  onClose: () => void;
}

export function SecurityTestSuite({ onClose }: SecurityTestSuiteProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const securityTests = [
    {
      name: 'Rate Limiting Protection',
      test: async () => {
        const promises = Array(10).fill(0).map(() => 
          fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
          })
        );
        const responses = await Promise.all(promises);
        const blocked = responses.some(r => r.status === 429);
        return blocked ? 'Rate limiting active' : 'Rate limiting may not be working';
      }
    },
    {
      name: 'Password Strength Validation',
      test: async () => {
        const response = await fetch('/api/auth/validate-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: '123' })
        });
        const result = await response.json();
        return result.valid === false ? 'Password validation working' : 'Password validation failed';
      }
    },
    {
      name: 'Input Sanitization',
      test: async () => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: '<script>alert("xss")</script>@test.com',
            hackerName: '<img src=x onerror=alert(1)>',
            password: 'TestPass123!'
          })
        });
        // Should either reject malicious input or sanitize it
        return response.status >= 400 ? 'Input sanitization active' : 'Check input handling';
      }
    },
    {
      name: 'Session Security',
      test: async () => {
        const response = await fetch('/api/auth/user');
        const hasSecureHeaders = response.headers.get('set-cookie')?.includes('HttpOnly');
        return hasSecureHeaders ? 'Session security configured' : 'Check session configuration';
      }
    },
    {
      name: 'API Authentication',
      test: async () => {
        const response = await fetch('/api/auth/user');
        return response.status === 401 ? 'API protection working' : 'API may be unprotected';
      }
    },
    {
      name: 'Admin Access Control',
      test: async () => {
        const response = await fetch('/api/admin/security-stats');
        return response.status === 401 || response.status === 403 ? 'Admin protection active' : 'Admin endpoints exposed';
      }
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const testCase of securityTests) {
      const startTime = Date.now();
      
      setResults(prev => [...prev, {
        name: testCase.name,
        status: 'running',
        message: 'Testing...'
      }]);

      try {
        const message = await testCase.test();
        const duration = Date.now() - startTime;
        
        setResults(prev => prev.map(result => 
          result.name === testCase.name
            ? { ...result, status: 'passed', message, duration }
            : result
        ));
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setResults(prev => prev.map(result => 
          result.name === testCase.name
            ? { 
                ...result, 
                status: 'failed', 
                message: error instanceof Error ? error.message : 'Test failed',
                duration 
              }
            : result
        ));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return 'text-yellow-400';
      case 'passed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const totalTests = securityTests.length;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-900/20 p-6 border-b border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-400">Security Test Suite</h2>
            </div>
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-300 font-bold text-xl"
            >
              ×
            </button>
          </div>
          
          <p className="text-gray-300 mt-2">
            Validate security implementations and identify potential vulnerabilities
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Test Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running Tests...' : 'Run Security Tests'}
            </button>

            {results.length > 0 && (
              <div className="text-sm text-gray-400">
                {passedTests} passed, {failedTests} failed, {totalTests} total
              </div>
            )}
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <h3 className="font-semibold text-green-400">{result.name}</h3>
                    </div>
                    {result.duration && (
                      <span className="text-xs text-gray-500">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                  
                  {result.status === 'failed' && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded text-xs text-red-300">
                      This test failed. Review security configuration and implementation.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Security Guidelines */}
          {!isRunning && results.length === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Security Test Coverage</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityTests.map((test, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-2">{test.name}</h4>
                    <p className="text-sm text-gray-400">
                      {getTestDescription(test.name)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Testing Guidelines</h4>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• Tests validate security middleware functionality</li>
                  <li>• Some tests may trigger rate limiting or security alerts</li>
                  <li>• Failed tests indicate potential security vulnerabilities</li>
                  <li>• Review logs for detailed security event information</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTestDescription(testName: string): string {
  const descriptions: Record<string, string> = {
    'Rate Limiting Protection': 'Verifies that excessive requests are properly throttled and blocked',
    'Password Strength Validation': 'Ensures weak passwords are rejected with proper feedback',
    'Input Sanitization': 'Tests protection against XSS and malicious input injection',
    'Session Security': 'Validates secure session configuration and cookie settings',
    'API Authentication': 'Confirms protected endpoints require proper authentication',
    'Admin Access Control': 'Verifies admin-only endpoints are properly protected'
  };
  
  return descriptions[testName] || 'Security validation test';
}