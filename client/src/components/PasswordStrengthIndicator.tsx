import React, { useState, useEffect } from 'react';
import { Check, X, Shield, AlertTriangle } from 'lucide-react';

interface PasswordValidation {
  valid: boolean;
  score: number;
  feedback: string[];
}

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange?: (validation: PasswordValidation) => void;
}

export function PasswordStrengthIndicator({ password, onValidationChange }: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState<PasswordValidation>({
    valid: false,
    score: 0,
    feedback: []
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!password) {
      const emptyValidation = { valid: false, score: 0, feedback: [] };
      setValidation(emptyValidation);
      onValidationChange?.(emptyValidation);
      return;
    }

    const checkPassword = async () => {
      setIsChecking(true);
      try {
        const response = await fetch('/api/auth/validate-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        if (response.ok) {
          const result = await response.json();
          setValidation(result);
          onValidationChange?.(result);
        } else {
          // Fallback to client-side validation
          const clientValidation = validatePasswordClient(password);
          setValidation(clientValidation);
          onValidationChange?.(clientValidation);
        }
      } catch (error) {
        // Fallback to client-side validation
        const clientValidation = validatePasswordClient(password);
        setValidation(clientValidation);
        onValidationChange?.(clientValidation);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkPassword, 300);
    return () => clearTimeout(debounceTimer);
  }, [password, onValidationChange]);

  const validatePasswordClient = (pwd: string): PasswordValidation => {
    const feedback: string[] = [];
    let score = 0;

    if (pwd.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else if (pwd.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(pwd)) {
      feedback.push('Password must contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(pwd)) {
      feedback.push('Password must contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(pwd)) {
      feedback.push('Password must contain numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      feedback.push('Password must contain special characters');
    } else {
      score += 1;
    }

    const commonPatterns = [
      /123456/, /password/, /qwerty/, /abc123/, /admin/,
      /letmein/, /welcome/, /monkey/, /dragon/
    ];

    if (commonPatterns.some(pattern => pattern.test(pwd.toLowerCase()))) {
      feedback.push('Password contains common patterns');
      score -= 2;
    }

    return {
      valid: feedback.length === 0 && score >= 4,
      score: Math.max(0, score),
      feedback
    };
  };

  const getStrengthLevel = () => {
    if (validation.score >= 5) return { label: 'Very Strong', color: 'green', bgColor: 'bg-green-500' };
    if (validation.score >= 4) return { label: 'Strong', color: 'green', bgColor: 'bg-green-400' };
    if (validation.score >= 3) return { label: 'Good', color: 'yellow', bgColor: 'bg-yellow-400' };
    if (validation.score >= 2) return { label: 'Fair', color: 'orange', bgColor: 'bg-orange-400' };
    if (validation.score >= 1) return { label: 'Weak', color: 'red', bgColor: 'bg-red-400' };
    return { label: 'Very Weak', color: 'red', bgColor: 'bg-red-500' };
  };

  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'Contains lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'Contains uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'Contains number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: 'Contains special character', test: (pwd: string) => /[^a-zA-Z0-9]/.test(pwd) },
    { label: 'No common patterns', test: (pwd: string) => !(/123456|password|qwerty|abc123|admin|letmein|welcome|monkey|dragon/i.test(pwd)) }
  ];

  if (!password) return null;

  const strength = getStrengthLevel();

  return (
    <div className="space-y-3 p-4 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Password Strength</span>
        </div>
        {isChecking && (
          <div className="text-xs text-gray-400">Checking...</div>
        )}
      </div>

      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium text-${strength.color}-400`}>
            {strength.label}
          </span>
          <span className="text-xs text-gray-400">
            Score: {validation.score}/6
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strength.bgColor}`}
            style={{ width: `${Math.min(100, (validation.score / 6) * 100)}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-400 mb-2">Requirements:</div>
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <X className="w-3 h-3 text-red-400" />
              )}
              <span className={passed ? 'text-green-400' : 'text-gray-400'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Security Feedback */}
      {validation.feedback.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">Security Recommendations:</span>
          </div>
          {validation.feedback.map((feedback, index) => (
            <div key={index} className="text-xs text-gray-400 ml-5">
              • {feedback}
            </div>
          ))}
        </div>
      )}

      {/* Security Tips */}
      {validation.valid && (
        <div className="p-2 bg-green-900/20 border border-green-700 rounded text-xs text-green-300">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3 h-3" />
            <span className="font-medium">Security Tips:</span>
          </div>
          <ul className="space-y-1 ml-5">
            <li>• Use a unique password for each account</li>
            <li>• Consider using a password manager</li>
            <li>• Enable two-factor authentication when available</li>
          </ul>
        </div>
      )}
    </div>
  );
}