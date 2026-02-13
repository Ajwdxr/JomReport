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
                    <!-- Stats Cards -->
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

                    <!-- Filters & Search -->
                    <div class="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div class="flex-1 relative">
                            <i class="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="search-input" placeholder="Cari aduan..." 
                                class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-700 dark:text-gray-300">
                        </div>
                        
                        <select id="filter-status" class="bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                            <option value="all">Semua Status</option>
                            <option value="open">Open</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select id="filter-category" class="bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                            <option value="all">Semua Kategori</option>
                            <option value="Jalan Raya">Jalan Raya</option>
                            <option value="Lampu Jalan">Lampu Jalan</option>
                            <option value="Sampah">Sampah</option>
                            <option value="Banjir">Banjir</option>
                            <option value="Lain-lain">Lain-lain</option>
                        </select>
                    </div>

                    <!-- Reports Table -->
                    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div class="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 class="font-bold text-gray-900 dark:text-white">Senarai Aduan Terkini</h3>
                            <button id="refresh-btn" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">Refresh</button>
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
        this.reports = [];
        this.filteredReports = [];
        
        await this.loadAdminData();
        this.setupFilters();
        
        document.getElementById('refresh-btn').onclick = () => this.loadAdminData();
    }

    setupFilters() {
        const searchInput = document.getElementById('search-input');
        const filterStatus = document.getElementById('filter-status');
        const filterCategory = document.getElementById('filter-category');

        const filterData = () => {
            const query = searchInput.value.toLowerCase();
            const status = filterStatus.value;
            const category = filterCategory.value;

            this.filteredReports = this.reports.filter(report => {
                const matchesSearch = report.title.toLowerCase().includes(query) || 
                                      report.description.toLowerCase().includes(query) ||
                                      (report.profiles?.name || '').toLowerCase().includes(query);
                const matchesStatus = status === 'all' || report.status === status;
                const matchesCategory = category === 'all' || report.category === category;
                
                return matchesSearch && matchesStatus && matchesCategory;
            });

            this.renderTable();
        };

        searchInput.addEventListener('input', filterData);
        filterStatus.addEventListener('change', filterData);
        filterCategory.addEventListener('change', filterData);
    }

    async loadAdminData() {
        const table = document.getElementById('admin-reports-table');
        table.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-400 animate-pulse">Sedang memuatkan data...</td></tr>`;
        
        try {
            this.reports = await reportService.getAllReportsAdmin();
            this.filteredReports = [...this.reports];
            
            // Update Stats
            document.getElementById('total-reports').textContent = this.reports.length;
            document.getElementById('active-reports').textContent = this.reports.filter(r => r.status !== 'closed').length;
            document.getElementById('closed-reports').textContent = this.reports.filter(r => r.status === 'closed').length;

            this.renderTable();

        } catch (error) {
            console.error('Admin data error:', error);
            table.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-500 font-bold">Gagal memuatkan data. Ralat: ${error.message}</td></tr>`;
        }
    }

    renderTable() {
        const table = document.getElementById('admin-reports-table');
        if (this.filteredReports.length === 0) {
            table.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-400 mt-4">Tiada aduan dijumpai.</td></tr>`;
            return;
        }

        table.innerHTML = this.filteredReports.map(report => `
            <tr class="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                        ${report.image_url ? `<img src="${report.image_url}" class="h-10 w-10 rounded-lg object-cover">` : '<div class="h-10 w-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400"><i class="ri-image-line"></i></div>'}
                        <div>
                            <p class="font-bold text-gray-900 dark:text-white line-clamp-1">${report.title}</p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 font-medium italic">
                                ${new Date(report.created_at).toLocaleDateString()} • oleh ${report.profiles?.name || 'User'}
                            </p>
                        </div>
                    </div>
                </td>
                <td class="px-8 py-6">
                    <select class="status-select bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-bold dark:text-gray-200 uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" 
                        data-id="${report.id}" style="width: 140px;">
                        <option value="open" ${report.status === 'open' ? 'selected' : ''}>Open</option>
                        <option value="acknowledged" ${report.status === 'acknowledged' ? 'selected' : ''}>Acknowledged</option>
                        <option value="in_progress" ${report.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="closed" ${report.status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </td>
                <td class="px-8 py-6">
                     <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest whitespace-nowrap">${report.category}</span>
                </td>
                <td class="px-8 py-6">
                    <div class="flex gap-2">
                        <button class="hide-btn p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" data-id="${report.id}" data-hidden="${report.is_hidden}" title="${report.is_hidden ? 'Show' : 'Hide'}">
                            <i class="${report.is_hidden ? 'ri-eye-off-line' : 'ri-eye-line'} text-xl"></i>
                        </button>
                        <button class="detail-btn p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" data-id="${report.id}" title="View Details">
                            <i class="ri-file-list-3-line text-xl"></i>
                        </button>
                        <button class="delete-btn p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" data-id="${report.id}" title="Delete">
                            <i class="ri-delete-bin-line text-xl"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.setupRowListeners();
    }

    setupRowListeners() {
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.dataset.id;
                const status = e.target.value;
                const originalValue = e.target.getAttribute('data-original') || status; // Hack to store prev val if needed, simplified here
                
                try {
                    e.target.disabled = true;
                    await reportService.updateStatus(id, status);
                    e.target.classList.add('text-green-600');
                    setTimeout(() => e.target.classList.remove('text-green-600'), 2000);
                } catch (error) {
                    alert('Gagal mengemaskini status: ' + error.message);
                    e.target.value = originalValue; // Revert
                } finally {
                    e.target.disabled = false;
                }
            });
        });

        document.querySelectorAll('.hide-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const isHidden = btn.dataset.hidden === 'true';
                if(!confirm(`Adakah anda pasti mahu ${isHidden ? 'menunjuk semula' : 'menyembunyikan'} aduan ini?`)) return;

                try {
                    await reportService.hideReport(id, !isHidden);
                    await this.loadAdminData(); // Refresh all data to reflect changes cleanly
                } catch (error) {
                    alert('Gagal mengubah keterlihatan aduan.');
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if(!confirm('AMARAN: Adakah anda pasti mahu memadam aduan ini? Tindakan ini tidak boleh dikembalikan.')) return;

                try {
                    await reportService.deleteReport(id);
                    await this.loadAdminData(); // Refresh all
                } catch (error) {
                    console.error(error);
                    alert('Gagal memadam aduan. Pastikan anda mempunyai akses admin.');
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
