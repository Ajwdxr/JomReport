import { supabase } from "../api/supabase.js";
import { reportService } from "../api/reports.js";
import { sanitizeHTML } from '../utils/security.js';

export default class Home {
  constructor(app) {
    this.app = app;
    this.points = 0;
  }

  async render() {
    return `
            <div class="pb-24 min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <nav class="sticky top-0 z-50 glass dark:bg-slate-900/70 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <i class="ri-megaphone-fill text-xl"></i>
                        </div>
                        <span class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tighter">JomReport</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <button id="theme-toggle" class="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-yellow-400 hover:scale-110 active:scale-95 transition-all">
                            <i class="${this.app.theme === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill'} text-xl"></i>
                        </button>
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest leading-none">Mata</span>
                            <span id="user-points" class="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-tight">${this.points}</span>
                        </div>
                        <div class="h-10 w-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden cursor-pointer bg-gray-100 dark:bg-slate-800" id="profile-btn">
                            <img src="${this.app.user?.user_metadata?.avatar_url || ""}" alt="Avatar" class="h-full w-full object-cover">
                        </div>
                        <button id="logout-btn" class="text-gray-400 hover:text-red-500 transition-colors">
                            <i class="ri-logout-box-r-line text-xl"></i>
                        </button>
                    </div>
                </nav>

                <main class="max-w-2xl mx-auto px-6 py-8 space-y-8">
                    <header class="space-y-2">
                        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">Suaramu, <br><span class="text-primary dark:text-indigo-400 text-4xl">Tindakan Kami.</span></h2>
                        <p class="text-gray-500 dark:text-gray-400 font-medium">Lihat apa yang berlaku di kawasan anda.</p>
                    </header>

                    <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                        <button class="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none shrink-0 flex items-center gap-2">
                            <i class="ri-apps-fill"></i> Semua
                        </button>
                        <button class="bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-2xl font-bold border border-gray-100 dark:border-slate-800 shrink-0 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <i class="ri-time-line"></i> Baru
                        </button>
                        <button class="bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-2xl font-bold border border-gray-100 dark:border-slate-800 shrink-0 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <i class="ri-loader-2-line"></i> Proses
                        </button>
                        <button class="bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-2xl font-bold border border-gray-100 dark:border-slate-800 shrink-0 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <i class="ri-checkbox-circle-line"></i> Selesai
                        </button>
                    </div>

                    <div id="feed" class="space-y-6">
                        <div class="flex flex-col items-center justify-center p-12 text-gray-400 dark:text-gray-600">
                             <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                             <p>Memuatkan aduan...</p>
                        </div>
                    </div>
                </main>

                <!-- Bottom Navigation -->
                <div class="fixed bottom-0 left-0 right-0 glass dark:bg-slate-900/80 border-t border-gray-100 dark:border-slate-800 px-10 py-4 flex justify-between items-center z-50 rounded-t-[32px]">
                    <button class="text-indigo-600 dark:text-indigo-400 flex flex-col items-center gap-1" onclick="window.app.navigateTo('/')">
                        <i class="ri-home-5-fill text-2xl"></i>
                        <span class="text-[10px] font-bold uppercase tracking-tighter">Utama</span>
                    </button>
                    
                    <button id="add-btn" class="bg-indigo-600 text-white w-14 h-14 rounded-2xl shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/50 -mt-14 transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-4 border-white dark:border-slate-900">
                        <i class="ri-add-line text-3xl font-bold"></i>
                    </button>

                    <button class="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-1" onclick="window.app.navigateTo('/admin')">
                        <i class="ri-shield-user-line text-2xl"></i>
                        <span class="text-[10px] font-bold uppercase tracking-tighter">Admin</span>
                    </button>
                </div>
            </div>
        `;
  }

  async afterRender() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.onclick = () => {
                if (window.app && typeof window.app.toggleTheme === 'function') {
                    window.app.toggleTheme();
                    this.render().then(html => {
                        this.app.appElement.innerHTML = html;
                        this.afterRender();
                    });
                } else {
                    console.error('toggleTheme function missing on global app instance');
                }
            };
        }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const conf = confirm("Adakah anda pasti mahu keluar?");
        if (conf) {
          await supabase.auth.signOut();
          this.app.navigateTo("/login");
        }
      });
    }

    const addBtn = document.getElementById("add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.app.navigateTo("/create");
      });
    }

    const profileBtn = document.getElementById("profile-btn");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        alert(
          "Mata anda: " + (this.points || 0) + "\nTahap: Masyarakat Prihatin",
        );
      });
    }

    this.updateUserPoints();
    this.loadFeed();
  }

  async updateUserPoints() {
    const pointsEl = document.getElementById("user-points");
    try {
      const { data } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", this.app.user.id)
        .single();
      if (data) {
        this.points = data.points;
        if (pointsEl) pointsEl.textContent = data.points;
      }
    } catch (e) {}
  }

  async loadFeed() {
    const feedContainer = document.getElementById("feed");
    try {
      const reports = await reportService.getAllReports();
      if (!reports || reports.length === 0) {
        feedContainer.innerHTML = `
                    <div class="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
                        <div class="text-indigo-100 text-7xl flex justify-center"><i class="ri-draft-line"></i></div>
                        <h3 class="text-xl font-bold text-gray-900">Belum ada aduan?</h3>
                        <p class="text-gray-500 font-medium leading-relaxed">Jadilah yang pertama melaporkan masalah di kawasan anda.</p>
                        <button class="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100" id="mula-melapor-btn">Mula Melapor</button>
                    </div>
                `;
        document
          .getElementById("mula-melapor-btn")
          ?.addEventListener("click", () => this.app.navigateTo("/create"));
        return;
      }

      feedContainer.innerHTML = reports
        .map(
          (report) => `
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer report-card group" data-id="${report.id}">
                    ${
                      report.image_url
                        ? `
                        <div class="h-52 overflow-hidden">
                            <img src="${report.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        </div>`
                        : ""
                    }
                    <div class="p-6 space-y-4">
                        <div class="flex justify-between items-start">
                            <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1">
                                <i class="ri-price-tag-3-line text-xs"></i> ${report.category}
                            </span>
                            <span class="text-[10px] font-black ${this.getStatusColor(report.status)} uppercase tracking-widest px-3 py-1 rounded-lg border border-current opacity-80">${report.status}</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${sanitizeHTML(report.title)}</h3>
                        
                        ${report.address ? `
                        <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                            <i class="ri-map-pin-line"></i>
                            <span class="truncate">${sanitizeHTML(report.address)}</span>
                        </div>
                        ` : ''}

                        <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed font-medium">${sanitizeHTML(report.description)}</p>
                        <div class="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800">
                            <div class="flex items-center gap-2">
                                <img src="${report.profiles?.avatar_url || ""}" class="h-7 w-7 rounded-full bg-gray-200 dark:bg-slate-700">
                                <span class="text-xs font-bold text-gray-700 dark:text-gray-300">${sanitizeHTML(report.profiles?.name || 'User')}</span>
                            </div>
                            <div class="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs font-semibold">
                                <i class="ri-calendar-line text-xs"></i>
                                <span>${new Date(report.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("");

      document.querySelectorAll(".report-card").forEach((card) => {
        card.addEventListener("click", () => {
          this.app.navigateTo("/report?id=" + card.dataset.id);
        });
      });
    } catch (error) {
      console.error("Feed error:", error);
      feedContainer.innerHTML = `<p class="text-center text-red-500 p-8">Gagal memuatkan aduan. Sila cuba lagi.</p>`;
    }
  }

  getStatusColor(status) {
    const colors = {
      open: "bg-blue-50 text-blue-600",
      acknowledged: "bg-yellow-50 text-yellow-600",
      in_progress: "bg-orange-50 text-orange-600",
      closed: "bg-emerald-50 text-emerald-600",
    };
    return colors[status] || "bg-gray-50 text-gray-600";
  }
}
