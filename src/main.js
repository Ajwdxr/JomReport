import { supabase } from './api/supabase.js';

const routes = {
    '': 'Home',
    '#login': 'Login',
    '#create': 'CreateReport',
    '#report': 'ReportDetail',
    '#admin': 'Admin'
};

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.init();
    }

    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        this.user = session?.user || null;

        supabase.auth.onAuthStateChange((event, session) => {
            this.user = session?.user || null;
            this.render();
        });

        window.addEventListener('hashchange', () => this.render());
        this.render();
    }

    navigateTo(path) {
        // Normalize path to hash
        if (path === '/') {
            window.location.hash = '';
        } else if (path.startsWith('/')) {
            window.location.hash = '#' + path.substring(1);
        } else {
            window.location.hash = path.startsWith('#') ? path : '#' + path;
        }
    }

    async render() {
        const fullHash = window.location.hash;
        const pageKey = fullHash.split('?')[0] || '';
        
        // Handle Supabase Auth Fragments (don't redirect during login processing)
        if (fullHash.includes('access_token=') || fullHash.includes('type=recovery')) {
            return; 
        }

        // Auth Check
        if (!this.user && pageKey !== '#login') {
            this.navigateTo('#login');
            return;
        }

        // Auto-redirect if logged in
        if (this.user && pageKey === '#login') {
            this.navigateTo('/');
            return;
        }

        const pageName = routes[pageKey] || 'Home';

        try {
            const module = await import(`./pages/${pageName}.js`);
            const page = new module.default(this);
            const content = await page.render();
            this.appElement.innerHTML = content;
            if (page.afterRender) page.afterRender();
        } catch (error) {
            console.error('Render error:', error);
            this.appElement.innerHTML = `<div class="p-8 text-center text-red-500 font-bold">Ralat memuatkan laman: ${pageName}</div>`;
        }
    }
}

window.app = new App();
