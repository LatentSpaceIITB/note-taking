'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithGoogle, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { OrbBackground } from '@/components/landing/GradientOrb';
import { FadeInView, StaggerContainer, StaggerItem } from '@/components/animations/FadeInView';
import { EASING } from '@/lib/animations';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase not configured');
      return;
    }

    setError(null);
    setSigningIn(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-3 border-teal-200 border-t-teal-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <OrbBackground variant="minimal" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <FadeInView className="mb-10 text-center">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-teal-900/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill="white"
              />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome back</h1>
          <p className="text-stone-500">
            Sign in to continue capturing your lectures
          </p>
        </FadeInView>

        {/* Sign in card */}
        <FadeInView delay={0.1}>
          <GlassCard padding="xl" className="w-full">
            {error && (
              <motion.div
                className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-rose-600 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </motion.div>
            )}

            <motion.button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white font-semibold rounded-xl transition-colors shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {signingIn ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {signingIn ? 'Signing in...' : 'Continue with Google'}
            </motion.button>

            <p className="mt-6 text-center text-xs text-stone-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </GlassCard>
        </FadeInView>

        {/* Features preview */}
        <FadeInView delay={0.2} className="mt-12">
          <StaggerContainer className="grid grid-cols-3 gap-6">
            <StaggerItem className="text-center">
              <div className="w-12 h-12 bg-teal-50 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium">Record</p>
            </StaggerItem>
            <StaggerItem className="text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium">Transcribe</p>
            </StaggerItem>
            <StaggerItem className="text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium">AI Notes</p>
            </StaggerItem>
          </StaggerContainer>
        </FadeInView>
      </div>
    </div>
  );
}
