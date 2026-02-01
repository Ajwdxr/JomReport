import { supabase } from '../api/supabase.js';
import { reportService } from '../api/reports.js';
import { gamificationService } from '../api/gamification.js';

export default class ReportDetail {
    constructor(app) {
        this.app = app;
        const params = new URLSearchParams(window.location.search);
        this.reportId = params.get('id');
    }

    async render() {
        return `
            <div class="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
                <nav class="sticky top-0 z-50 glass dark:bg-slate-900/70 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                    <button onclick="window.history.back()" class="text-gray-600 dark:text-gray-400 flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        <i class="ri-arrow-left-line text-2xl"></i>
                    </button>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">Perincian Aduan</span>
                    <button id="follow-btn" class="text-sm font-bold text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center gap-2 active:scale-95 transition-transform">
                        <i class="ri-notification-3-line text-lg"></i> Ikuti
                    </button>
                </nav>

                <div id="report-content" class="p-6 space-y-8 animate-fade-in">
                    <div class="animate-pulse space-y-4">
                        <div class="bg-gray-200 dark:bg-slate-800 h-64 w-full rounded-3xl"></div>
                        <div class="h-8 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        if (!this.reportId) {
            alert('Aduan tidak dijumpai');
            this.app.navigateTo('/');
            return;
        }

        try {
            const report = await reportService.getReportById(this.reportId);
            const isFollowing = await reportService.isFollowing(this.reportId);
            
            this.renderReport(report, isFollowing);
            this.setupListeners(report);
        } catch (error) {
            console.error('Detail error:', error);
            document.getElementById('report-content').innerHTML = `<p class="text-center text-red-500">Gagal memuatkan data aduan.</p>`;
        }
    }

    renderReport(report, isFollowing) {
        const container = document.getElementById('report-content');
        const followBtn = document.getElementById('follow-btn');
        
        if (isFollowing) {
            followBtn.innerHTML = `<i class="ri-notification-off-line text-lg"></i> Diikuti`;
            followBtn.classList.remove('bg-indigo-50', 'text-indigo-600');
            followBtn.classList.add('bg-gray-100', 'text-gray-500');
            followBtn.disabled = true;
        }

        container.innerHTML = `
            ${report.image_url ? `<img src="${report.image_url}" class="w-full h-80 object-cover rounded-[32px] shadow-2xl border-4 border-white dark:border-slate-800">` : ''}
            
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <span class="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2">
                        <i class="ri-price-tag-3-line text-sm"></i> ${report.category}
                    </span>
                    <span class="text-xs font-bold ${this.getStatusColor(report.status)} px-4 py-1.5 rounded-xl uppercase tracking-wider border">${report.status}</span>
                </div>
                <h1 class="text-3xl font-black text-gray-900 dark:text-white leading-tight">${report.title}</h1>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">${report.description}</p>
            </div>

            <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <img src="${report.profiles?.avatar_url || ''}" class="h-14 w-14 rounded-full border-2 border-indigo-50 dark:border-slate-800 shadow-sm">
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white text-lg">${report.profiles?.name || 'User'}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1 uppercase tracking-wider">
                        <i class="ri-calendar-line text-sm"></i> ${new Date(report.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <!-- Timeline Updates -->
            <section class="space-y-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="ri-pulse-line text-indigo-500 dark:text-indigo-400 text-2xl"></i>
                    Kronologi Aduan
                </h3>
                <div class="space-y-8 border-l-2 border-indigo-100 dark:border-slate-800 ml-3.5 pl-8 relative">
                    ${report.report_updates.map(update => `
                        <div class="relative">
                            <div class="absolute -left-[43px] top-1 w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 border-4 border-white dark:border-slate-950 shadow-md"></div>
                            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
                                <p class="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">${update.content}</p>
                                <div class="flex items-center gap-2 mt-4 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                                    <i class="ri-time-line text-xs"></i>
                                    ${new Date(update.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${report.report_updates.length === 0 ? '<p class="text-gray-400 dark:text-gray-600 font-medium ml-2">Belum ada kemaskini status.</p>' : ''}
                </div>
            </section>

            <!-- Comments Section -->
            <section class="space-y-6 pt-4 pb-12">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="ri-chat-3-line text-indigo-500 dark:text-indigo-400 text-2xl"></i>
                    Komen Komuniti
                </h3>
                <div id="comments-list" class="space-y-5">
                    ${report.comments.map(comment => `
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center gap-3 mb-3">
                                <img src="${comment.profiles?.avatar_url || ''}" class="h-8 w-8 rounded-full shadow-sm">
                                <span class="text-sm font-bold text-gray-800 dark:text-gray-200">${comment.profiles?.name || 'User'}</span>
                            </div>
                            <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">${comment.content}</p>
                        </div>
                    `).join('')}
                </div>
                
                <form id="comment-form" class="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-[24px] border border-gray-200 dark:border-slate-800 shadow-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input type="text" id="comment-input" placeholder="Tulis komen anda..." class="flex-1 px-5 py-3 outline-none text-sm font-bold text-gray-700 dark:text-gray-300 bg-transparent">
                    <button type="submit" class="bg-indigo-600 text-white p-4 rounded-[18px] shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-90 hover:bg-indigo-700">
                        <i class="ri-send-plane-fill text-xl"></i>
                    </button>
                </form>
            </section>
        `;
    }

    setupListeners(report) {
        const followBtn = document.getElementById('follow-btn');
        const commentForm = document.getElementById('comment-form');

        followBtn.addEventListener('click', async () => {
            try {
                await reportService.followReport(this.reportId);
                followBtn.innerHTML = `<i class="ri-notification-off-line text-lg"></i> Diikuti`;
                followBtn.classList.remove('bg-indigo-50', 'text-indigo-600');
                followBtn.classList.add('bg-gray-100', 'text-gray-500');
                followBtn.disabled = true;
            } catch (error) {
                alert('Gagal mengikuti aduan.');
            }
        });

        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('comment-input');
            const content = input.value.trim();
            if (!content) return;

            try {
                const comment = await reportService.addComment(this.reportId, content);
                const commentsList = document.getElementById('comments-list');
                const newCommentHtml = `
                    <div class="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 animate-fade-in">
                        <div class="flex items-center gap-3 mb-3">
                            <img src="${this.app.user?.user_metadata?.avatar_url || ''}" class="h-8 w-8 rounded-full shadow-sm">
                            <span class="text-sm font-bold text-gray-800">${this.app.user?.user_metadata?.full_name || 'Anda'}</span>
                        </div>
                        <p class="text-gray-700 text-sm leading-relaxed font-medium">${content}</p>
                    </div>
                `;
                commentsList.insertAdjacentHTML('beforeend', newCommentHtml);
                input.value = '';
                await gamificationService.addPoints(this.app.user.id, 'COMMENT');
            } catch (error) {
                alert('Gagal menghantar komen.');
            }
        });
    }

    getStatusColor(status) {
        const colors = {
            'open': 'bg-blue-50 text-blue-600 border-blue-100',
            'acknowledged': 'bg-yellow-50 text-yellow-600 border-yellow-100',
            'in_progress': 'bg-orange-50 text-orange-600 border-orange-100',
            'closed': 'bg-emerald-50 text-emerald-600 border-emerald-100'
        };
        return colors[status] || 'bg-gray-50 text-gray-600 border-gray-100';
    }
}
