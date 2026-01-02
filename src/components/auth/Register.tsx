'use client';

import {
  BookOpen,
  KeyRound,
  Lock,
  UserCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';

import GradientButton from '@/components/ui/GradientButton';

import { InputField } from './InputField';

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [username, setUsername] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_number: rollNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send verification link');
      }
      setLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          username,
          password,
          confirmpassword: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-gray-800 shadow-2xl mt-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
        <p className="text-gray-300 mb-6">
          We have sent a verification link to <strong>{rollNumber}@nitkkr.ac.in</strong>.
          Please click the link to verify your identity and complete your registration.
        </p>
        <button
          onClick={() => setLinkSent(false)}
          className="text-primary-blue hover:text-primary-cyan transition-colors"
        >
          Try a different roll number
        </button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-gray-800 shadow-2xl mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-blue via-primary-cyan to-primary-purple">
          {token ? 'Complete Registration' : 'Create Account'}
        </h2>
        <p className="mt-2 text-gray-400">Join The Mathematical Society</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">

          {!token ? (
            <div>
              <label
                htmlFor="rollNumber"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  id="rollNumber"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="block w-full pl-10 pr-24 py-2.5 bg-black/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue/50 text-white placeholder-gray-500 transition-colors"
                  placeholder="Enter your roll number"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isLoading || !rollNumber}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-blue/20 hover:bg-primary-blue/30 text-primary-blue rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Verify'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: A verification link will be sent to your institute email.
              </p>
            </div>
          ) : (
            <>
              <InputField
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<UserCircle2 className="h-5 w-5 text-gray-500" />}
                placeholder="Enter your username"
                disabled={isLoading}
              />

              <InputField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<KeyRound className="h-5 w-5 text-gray-500" />}
                placeholder="Enter your password"
                disabled={isLoading}
              />

              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="h-5 w-5 text-gray-500" />}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </>
          )}

        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-3 rounded-lg">
            {error}
          </div>
        )}

        {token && (
          <div className="pt-2">
            <GradientButton
              type="submit"
              className="w-full py-2.5 justify-center"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </GradientButton>
          </div>
        )}
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Already have an account?{' '}
          <span className="text-primary-cyan hover:text-primary-blue transition-colors">
            Sign in
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-12">Loading...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
