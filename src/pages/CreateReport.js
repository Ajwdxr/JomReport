import { supabase } from '../api/supabase.js';
import { reportService } from '../api/reports.js';
import { gamificationService } from '../api/gamification.js';

export default class CreateReport {
    constructor(app) {
        this.app = app;
    }

    async render() {
        return `
            <div class="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
                <nav class="sticky top-0 z-50 glass dark:bg-slate-900/70 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                    <button onclick="window.history.back()" class="text-gray-600 dark:text-gray-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">Buat Aduan Baru</span>
                    <div class="w-6"></div>
                </nav>

                <main class="px-6 py-8">
                    <form id="report-form" class="space-y-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tajuk Aduan</label>
                            <input type="text" name="title" id="title" required placeholder="Contoh: Jalan Berlubang di Seksyen 7" 
                                class="form-input w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kategori</label>
                                <select name="category" id="category" required class="form-input w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                                    <option value="Jalan Raya">Jalan Raya</option>
                                    <option value="Lampu Jalan">Lampu Jalan</option>
                                    <option value="Sampah">Sampah</option>
                                    <option value="Banjir">Banjir</option>
                                    <option value="Lain-lain">Lain-lain</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lokasi</label>
                                <button type="button" id="get-location" class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 shadow-sm truncate">
                                    <svg class="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    <span id="location-text">Kesan Lokasi Saya</span>
                                </button>
                                <input type="hidden" name="latitude" id="lat">
                                <input type="hidden" name="longitude" id="lng">
                                <input type="hidden" name="address" id="address">
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gambar (Opsional)</label>
                            <label class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group overflow-hidden">
                                <div id="file-placeholder" class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-10 h-10 text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 font-medium text-center px-4">Klik untuk Ambil Gambar atau Pilih Fail</p>
                                </div>
                                <img id="image-preview" class="absolute inset-0 w-full h-full object-cover hidden" />
                                <input type="file" id="image-input" name="image" class="hidden" accept="image/*" />
                            </label>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Penerangan</label>
                            <textarea name="description" id="description" required rows="4" placeholder="Ceritakan lebih lanjut tentang aduan anda..." 
                                class="form-input w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"></textarea>
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
        const imageInput = document.getElementById('image-input');
        const imagePreview = document.getElementById('image-preview');
        const filePlaceholder = document.getElementById('file-placeholder');

        // Restore form state
        this.restoreFormState();

        // Listen for input changes to save state
        form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => this.saveFormState());
        });

        // Image Handling
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    imagePreview.classList.remove('hidden');
                    filePlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
                // Note: File itself can't be saved in localStorage easily, 
                // but at least we have the text data saved if camera kills the app.
            }
        });

        locBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locText.textContent = "Mencari...";
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    latInput.value = lat;
                    lngInput.value = lng;
                    
                    try {
                        // Reverse Geocoding using Nominatim (Free)
                        // Requirement: User-Agent header is MUST for Nominatim to avoid CORS/403
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                            headers: { 
                                'Accept-Language': 'ms,en',
                                'User-Agent': 'JomReport-Community-App' 
                            }
                        });
                        const data = await response.json();
                        const addressStr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        locText.textContent = addressStr;
                        document.getElementById('address').value = addressStr;
                    } catch (error) {
                        console.error('Reverse geocode error:', error);
                        locText.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }

                    locBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
                    locBtn.classList.add('text-indigo-600', 'dark:text-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30');
                    this.saveFormState();
                }, (err) => {
                    console.error('Location error:', err);
                    alert("Gagal mengambil lokasi. Sila pastikan GPS diaktifkan.");
                    locText.textContent = "Gagal Ambil Lokasi";
                }, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
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
                const reportData = {
                    title: formData.get('title'),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    latitude: formData.get('latitude'),
                    longitude: formData.get('longitude'),
                    address: formData.get('address'),
                    image: imageInput.files[0]
                };

                await reportService.createReport(reportData);
                
                // Add points
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await gamificationService.addPoints(user.id, 'CREATE_REPORT');

                // Clear saved state
                localStorage.removeItem('report_form_state');
                
                this.app.navigateTo('/');
            } catch (error) {
                console.error('Submit error:', error);
                alert('Gagal menghantar aduan: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Hantar Aduan";
            }
        });
    }

    saveFormState() {
        const state = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            latitude: document.getElementById('lat').value,
            longitude: document.getElementById('lng').value,
            locationText: document.getElementById('location-text').textContent,
            address: document.getElementById('address').value
        };
        localStorage.setItem('report_form_state', JSON.stringify(state));
    }

    restoreFormState() {
        const saved = localStorage.getItem('report_form_state');
        if (saved) {
            const state = JSON.parse(saved);
            if (state.title) document.getElementById('title').value = state.title;
            if (state.category) document.getElementById('category').value = state.category;
            if (state.description) document.getElementById('description').value = state.description;
            if (state.latitude) {
                document.getElementById('lat').value = state.latitude;
                document.getElementById('lng').value = state.longitude;
                document.getElementById('address').value = state.address || state.locationText;
                const locBtn = document.getElementById('get-location');
                const locText = document.getElementById('location-text');
                locText.textContent = state.locationText || "Lokasi Berjaya Diambil";
                locBtn.classList.remove('text-gray-500');
                locBtn.classList.add('text-indigo-600', 'bg-indigo-50');
            }
        }
    }
}
