import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../components/SupabaseClient';
import { AmoAILogo } from '../components/Logo';

const AuthScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-amo-beige">
        <div className="mb-8">
            <AmoAILogo className="text-amo-dark" />
        </div>
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-center text-amo-dark mb-1">Welcome to AMO AI</h2>
        <p className="text-gray-600 text-center mb-6">Sign in to continue to your dashboard.</p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#E87C4D',
                  brandAccent: '#e16a37',
                },
              },
            },
          }}
          providers={['google', 'github']}
          theme="light"
        />
      </div>
    </div>
  );
};

export default AuthScreen;