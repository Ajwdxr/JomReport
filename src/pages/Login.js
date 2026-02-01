import { supabase } from '../api/supabase.js';

export default class Login {
    constructor(app) {
        this.app = app;
    }

    async render() {
        return `
            <div class="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-600 to-emerald-500">
                <div class="max-w-md w-full glass p-10 rounded-3xl shadow-2xl text-center space-y-8 animate-fade-in">
                    <div class="space-y-4">
                        <img src="icons/icon-192x192.png" alt="Logo" class="mx-auto h-24 w-24 rounded-2xl shadow-lg">
                        <h1 class="text-4xl font-extrabold text-white tracking-tight">JomReport</h1>
                        <p class="text-indigo-100 text-lg">Bersama membina komuniti yang lebih baik, telus, dan sejahtera.</p>
                    </div>
                    
                    <div class="pt-6">
                        <button id="google-login" class="w-full flex items-center justify-center gap-4 bg-white text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 group shadow-lg">
                            <svg class="w-6 h-6 transition-transform group-hover:rotate-12" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Log Masuk dengan Google
                        </button>
                    </div>

                    <p class="text-xs text-indigo-100/60 pt-4 uppercase tracking-widest font-semibold">Smart Community Platform</p>
                </div>
            </div>
            <style>
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            </style>
        `;
    }

    afterRender() {
        const loginBtn = document.getElementById('google-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + window.location.pathname
                    }
                });
                if (error) alert('Error: ' + error.message);
            });
        }
    }
}
