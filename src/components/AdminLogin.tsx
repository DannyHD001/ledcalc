import { useState } from 'react';
import { Lock, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AdminLogin() {
  const { isAuthenticated, signIn, signOut, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSigningIn(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.success) {
        setShowLogin(false);
        setEmail('');
        setPassword('');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {isAuthenticated ? (
        // Admin is logged in - show logout button
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg text-sm transition-colors"
          title="Admin logged in - Click to logout"
        >
          <User className="w-4 h-4" />
          <span>Admin</span>
          <LogOut className="w-4 h-4" />
        </button>
      ) : (
        // Not logged in - show login button/form
        <div className="relative">
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
            title="Admin login"
          >
            <Lock className="w-4 h-4" />
          </button>

          {showLogin && (
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Admin Login</h3>
              
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-xs">{error}</div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={signingIn}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    {signingIn ? 'Signing in...' : 'Sign In'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
