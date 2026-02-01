import { supabase } from '../api/supabase.js';
import { reportService } from '../api/reports.js';
import { gamificationService } from '../api/gamification.js';

export default class CreateReport {
    constructor(app) {
        this.app = app;
    }

    async render() {
        return `
            <div class="min-h-screen bg-gray-50 pb-20">
                <nav class="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <button onclick="window.history.back()" class="text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <span class="text-lg font-bold text-gray-900">Buat Aduan Baru</span>
                    <div class="w-6"></div>
                </nav>

                <main class="px-6 py-8">
                    <form id="report-form" class="space-y-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 uppercase tracking-wider">Tajuk Aduan</label>
                            <input type="text" name="title" required placeholder="Contoh: Jalan Berlubang di Seksyen 7" 
                                class="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 uppercase tracking-wider">Kategori</label>
                                <select name="category" required class="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                                    <option value="Jalan Raya">Jalan Raya</option>
                                    <option value="Lampu Jalan">Lampu Jalan</option>
                                    <option value="Sampah">Sampah</option>
                                    <option value="Banjir">Banjir</option>
                                    <option value="Lain-lain">Lain-lain</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 uppercase tracking-wider">Lokasi</label>
                                <button type="button" id="get-location" class="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-left text-sm font-medium text-gray-500 flex items-center gap-2 shadow-sm truncate">
                                    <svg class="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    <span id="location-text">Kesan Lokasi Saya</span>
                                </button>
                                <input type="hidden" name="latitude" id="lat">
                                <input type="hidden" name="longitude" id="lng">
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 uppercase tracking-wider">Gambar (Opsional)</label>
                            <label class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-3xl bg-white hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-10 h-10 text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    <p class="text-sm text-gray-500 font-medium">Klik untuk muat naik gambar</p>
                                </div>
                                <input type="file" name="image" class="hidden" accept="image/*" />
                            </label>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 uppercase tracking-wider">Penerangan</label>
                            <textarea name="description" required rows="4" placeholder="Ceritakan lebih lanjut tentang aduan anda..." 
                                class="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"></textarea>
                        </div>

                        <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.01] transition-transform active:scale-95">Hantar Aduan</button>
                    </form>
                </main>
            </div>
        `;
    }

    afterRender() {
        const form = document.getElementById('report-form');
        const locBtn = document.getElementById('get-location');
        const locText = document.getElementById('location-text');
        const latInput = document.getElementById('lat');
        const lngInput = document.getElementById('lng');

        locBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locText.textContent = "Mencari...";
                navigator.geolocation.getCurrentPosition((pos) => {
                    latInput.value = pos.coords.latitude;
                    lngInput.value = pos.coords.longitude;
                    locText.textContent = "Lokasi Berjaya Diambil";
                    locBtn.classList.remove('text-gray-500');
                    locBtn.classList.add('text-indigo-600', 'bg-indigo-50');
                }, () => {
                    alert("Gagal mengambil lokasi.");
                    locText.textContent = "Gagal Ambil Lokasi";
                });
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Menghantar...";

            try {
                const formData = new FormData(form);
                const fileInput = form.querySelector('input[type="file"]');
                const imageFile = fileInput.files[0];

                const reportData = {
                    title: formData.get('title'),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    latitude: formData.get('latitude'),
                    longitude: formData.get('longitude'),
                    image: imageFile
                };

                const report = await reportService.createReport(reportData);
                
                // Add points
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await gamificationService.addPoints(user.id, 'CREATE_REPORT');

                this.app.navigateTo('/');
            } catch (error) {
                console.error('Submit error:', error);
                alert('Gagal menghantar aduan: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Hantar Aduan";
            }
        });
    }
}
