/* =========================================
   1. GLOBAL VARIABLES & TRACK LIST
   ========================================= */
const tracks = [
    { title: "Ingatlah Hari Ini", src: "musik/lagu1.mp3" },
    { title: "Kisah Kasih Di Sekolah", src: "musik/lagu2.mp3" },
    { title: "Sampai Jumpa", src: "musik/lagu3.mp3" },
    { title: "Sesuatu Di Jogja", src: "musik/lagu4.mp3" },
    { title: "Kita Ke Sana", src: "musik/lagu5.mp3" }
];

let currentTrackIndex = 0;
let isPlaying = false;
const audio = new Audio(); // Membuat elemen audio lewat JS

/* =========================================
   2. FUNGSI NAVIGASI & UTAMA (Diakses HTML)
   ========================================= */

// --- Fungsi Ganti Tema (Dark/Light) ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');

    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// --- Fungsi Buka/Tutup Player Musik ---
function togglePlayer() {
    const playerCard = document.getElementById('musicPlayer'); // Sesuaikan ID di HTML
    playerCard.classList.toggle('active');
}

// --- Fungsi Scroll Reveal (Animasi saat scroll) ---
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            reveals[i].classList.add("active");
        }
    }
}

/* =========================================
   3. LOGIKA PLAYER MUSIK
   ========================================= */

function loadTrack(index) {
    currentTrackIndex = index;
    audio.src = tracks[index].src;
    document.getElementById('trackTitle').innerText = tracks[index].title;
    
    // Update Playlist Active State
    updatePlaylistActive();
}

function playPauseTrack() {
    const playIcon = document.getElementById('playIcon'); // Pastikan ID icon play ada
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    } else {
        audio.play().catch(error => console.log("Playback dicegah browser:", error));
        isPlaying = true;
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if(isPlaying) audio.play();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if(isPlaying) audio.play();
}

function updatePlaylistActive() {
    // Reset semua
    const items = document.querySelectorAll('.playlist-item');
    items.forEach(item => item.classList.remove('active'));
    
    // Set yang aktif
    if(items[currentTrackIndex]) {
        items[currentTrackIndex].classList.add('active');
    }
}

// Format Waktu (Menit:Detik)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/* =========================================
   4. EVENT LISTENERS (Saat Web Dimuat)
   ========================================= */
window.addEventListener("DOMContentLoaded", () => {
    
    // A. Setup Awal
    document.body.style.visibility = 'visible';
    const overlay = document.getElementById('welcome-overlay');
    const startBtn = document.getElementById('startBtn');
    const loadingBar = document.querySelector('.loading-bar');
    
    // Cek Tema Tersimpan
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('theme-icon');
        if(icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    // B. Setup Playlist di HTML
    const playlistContainer = document.getElementById('playlist');
    if (playlistContainer) {
        playlistContainer.innerHTML = ""; // Bersihkan dulu
        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.classList.add('playlist-item');
            item.innerText = `${index + 1}. ${track.title}`;
            item.onclick = () => {
                loadTrack(index);
                if(!isPlaying) playPauseTrack(); // Auto play kalau diklik
                else audio.play();
            };
            playlistContainer.appendChild(item);
        });
    }

    // Load lagu pertama tapi jangan diputar dulu
    loadTrack(0);

    // C. Logic Welcome Screen
    if (overlay) {
        if(startBtn) startBtn.style.display = 'none';
        
        // Animasi Loading Palsu
        setTimeout(() => {
            if(loadingBar) loadingBar.style.display = 'none';
            if(startBtn) startBtn.style.display = 'inline-block';
        }, 2000);

// Saat tombol Start diklik
        if(startBtn) {
            startBtn.addEventListener('click', () => {
                overlay.classList.add('fade-out');
                
                // --- PERBAIKAN: PAKSA MUSIK NYALA DISINI ---
                // Karena user sudah berinteraksi (klik), browser akan mengizinkan audio play
                
                // 1. Pastikan status isPlaying jadi true
                isPlaying = true; 
                
                // 2. Putar audio
                audio.play().then(() => {
                    // Jika berhasil, ubah ikon jadi Pause
                    const playIcon = document.getElementById('playIcon');
                    if(playIcon) {
                        playIcon.classList.remove('fa-play');
                        playIcon.classList.add('fa-pause');
                    }
                }).catch(error => {
                    console.log("Browser menahan autoplay:", error);
                });

                // -------------------------------------------

                setTimeout(() => { 
                    overlay.style.display = 'none'; 
                    reveal(); // Trigger animasi scroll pertama kali
                }, 1000);
            });
        }
    }

    // D. Update Progress Bar Audio
    audio.addEventListener('timeupdate', () => {
        const progressBar = document.getElementById('progressBar');
        const currTime = document.getElementById('currTime');
        const durTime = document.getElementById('durTime');

        if (progressBar) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
        if (currTime) currTime.innerText = formatTime(audio.currentTime);
        if (durTime && audio.duration) durTime.innerText = formatTime(audio.duration);
    });

    // Auto Next saat lagu habis
    audio.addEventListener('ended', nextTrack);

    // Klik pada Progress Bar untuk lompat durasi
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });
    }

    // E. Jalankan Reveal saat scroll
    window.addEventListener("scroll", reveal);
});