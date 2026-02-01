import { supabase } from '../api/supabase.js';
import { reportService } from '../api/reports.js';

export default class Admin {
    constructor(app) {
        this.app = app;
    }

    async render() {
        // Simple security check (ideally handled in router too)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', this.app.user.id)
            .single();
        
        if (!profile || profile.role !== 'admin') {
            return `
                <div class="min-h-screen flex items-center justify-center bg-gray-50">
                    <div class="text-center space-y-4">
                        <div class="text-6xl">🚫</div>
                        <h1 class="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
                        <p class="text-gray-500">Anda tidak mempunyai kebenaran untuk mengakses laman ini.</p>
                        <button onclick="app.navigateTo('/')" class="text-indigo-600 font-bold">Kembali ke Utama</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
                <nav class="sticky top-0 z-50 bg-white dark:bg-slate-900 px-8 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
                    <div class="flex items-center gap-3">
                         <div class="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">AD</div>
                         <h1 class="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Admin<span class="text-indigo-600">Dashboard</span></h1>
                    </div>
                    <button onclick="window.app.navigateTo('/')" class="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Keluar</button>
                </nav>

                <main class="p-8 max-w-6xl mx-auto space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1">
                            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Jumlah Aduan</p>
                            <h2 id="total-reports" class="text-3xl font-black text-gray-900 dark:text-white">...</h2>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1">
                            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Aduan Aktif</p>
                            <h2 id="active-reports" class="text-3xl font-black text-orange-500">...</h2>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1">
                            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Selesai</p>
                            <h2 id="closed-reports" class="text-3xl font-black text-emerald-500">...</h2>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div class="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 class="font-bold text-gray-900 dark:text-white">Senarai Aduan Terkini</h3>
                            <button class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg">Refresh</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                        <th class="px-8 py-4">Aduan</th>
                                        <th class="px-8 py-4">Status</th>
                                        <th class="px-8 py-4">Kategori</th>
                                        <th class="px-8 py-4">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-reports-table">
                                    <tr><td colspan="4" class="p-8 text-center text-gray-400 animate-pulse">Memuatkan data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    async afterRender() {
        this.loadAdminData();
    }

    async loadAdminData() {
        const table = document.getElementById('admin-reports-table');
        try {
            const reports = await reportService.getAllReportsAdmin();
            
            // Update Stats
            document.getElementById('total-reports').textContent = reports.length;
            document.getElementById('active-reports').textContent = reports.filter(r => r.status !== 'closed').length;
            document.getElementById('closed-reports').textContent = reports.filter(r => r.status === 'closed').length;

            table.innerHTML = reports.map(report => `
                <tr class="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-8 py-6">
                        <div class="flex items-center gap-4">
                            ${report.image_url ? `<img src="${report.image_url}" class="h-10 w-10 rounded-lg object-cover">` : '<div class="h-10 w-10 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>'}
                            <div>
                                <p class="font-bold text-gray-900 dark:text-white line-clamp-1">${report.title}</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 font-medium italic">oleh ${report.profiles?.name || 'User'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-6">
                        <select class="status-select bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-bold dark:text-gray-200 uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500" 
                            data-id="${report.id}">
                            <option value="open" ${report.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="acknowledged" ${report.status === 'acknowledged' ? 'selected' : ''}>Acknowledged</option>
                            <option value="in_progress" ${report.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="closed" ${report.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </td>
                    <td class="px-8 py-6">
                         <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest">${report.category}</span>
                    </td>
                    <td class="px-8 py-6">
                        <div class="flex gap-2">
                            <button class="hide-btn p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" data-id="${report.id}" data-hidden="${report.is_hidden}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${report.is_hidden ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.046m4.51-4.51A9.959 9.959 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.046M12 9v6m3-3H9' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'}"/></svg>
                            </button>
                            <button class="detail-btn p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" data-id="${report.id}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            this.setupAdminListeners();

        } catch (error) {
            console.error('Admin data error:', error);
            table.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-500 font-bold">Gagal memuatkan data. Ralat: ${error.message}</td></tr>`;
        }
    }

    setupAdminListeners() {
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.dataset.id;
                const status = e.target.value;
                try {
                    await reportService.updateStatus(id, status);
                    // Optionally add a transition or notification
                } catch (error) {
                    alert('Gagal mengemaskini status.');
                }
            });
        });

        document.querySelectorAll('.hide-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const isHidden = btn.dataset.hidden === 'true';
                try {
                    await reportService.hideReport(id, !isHidden);
                    this.loadAdminData(); // Refresh table
                } catch (error) {
                    alert('Gagal mengubah keterlihatan aduan.');
                }
            });
        });

        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.app.navigateTo('/report?id=' + btn.dataset.id);
            });
        });
    }
}
