// dashboard/src/components/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
    const { user, loading, error } = useAuth();

    // Add/remove body class for auth pages
    useEffect(() => {
        if (!user && !loading) {
            document.body.classList.add('auth-active');
        } else {
            document.body.classList.remove('auth-active');
        }

        return () => {
            document.body.classList.remove('auth-active');
        };
    }, [user, loading]);

    if (loading) {
        return (
            <div className="auth-container bg-background">
                <div className="auth-content">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
                        <p className="text-text-muted">Checking authentication status</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container bg-background">
                <div className="auth-content">
                    <div className="text-center auth-card mx-auto">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-400 text-2xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
                        <p className="text-text-muted mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return children;
};

const LoginPage = () => {
    const { login } = useAuth();

    return (
        <div className="auth-container bg-gradient-to-br from-background via-background to-surface">
            <div className="auth-content">
                <div className="auth-card mx-auto">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                            🤖
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
                            Discord Bot Dashboard
                        </h1>
                        <p className="text-text-muted text-sm sm:text-base">
                            Sign in with Discord to access your bot management dashboard
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Welcome Back</h2>
                                <p className="text-text-muted text-sm">
                                    Connect your Discord account to manage your servers and bot settings
                                </p>
                            </div>

                            <button
                                onClick={login}
                                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                                </svg>
                                <span>Continue with Discord</span>
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-text-muted leading-relaxed">
                                    By signing in, you agree to our Terms of Service and Privacy Policy.<br />
                                    We only access basic profile information and server permissions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 text-center">
                        <div className="bg-surface/50 border border-border/50 rounded-xl p-3 sm:p-4">
                            <div className="text-xl sm:text-2xl mb-2">🛡️</div>
                            <h3 className="text-white font-medium text-xs sm:text-sm mb-1">Secure</h3>
                            <p className="text-text-muted text-xs">Discord OAuth 2.0</p>
                        </div>
                        <div className="bg-surface/50 border border-border/50 rounded-xl p-3 sm:p-4">
                            <div className="text-xl sm:text-2xl mb-2">⚡</div>
                            <h3 className="text-white font-medium text-xs sm:text-sm mb-1">Fast</h3>
                            <p className="text-text-muted text-xs">Real-time updates</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtectedRoute;