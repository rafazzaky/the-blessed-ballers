// --- BAGIAN 1: LOGIKA ANIMASI (Harus jalan duluan & mandiri) ---
const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

// Jalankan animasi untuk elemen yang sudah ada di HTML (Hero, About, dll)
document.addEventListener("DOMContentLoaded", initReveal);

// --- BAGIAN 2: LOGIKA JADWAL (Isolasi Error) ---
const URL_JADWAL =
  "https://raw.githubusercontent.com/rafazzaky/the-blessed-ballers/master/data/schedule.json";
const scheduleContainer = document.getElementById("schedule-container");

// Definisikan array pembantu di sini agar bisa diakses oleh renderJadwal
const hariArr = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const bulanArr = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

async function loadJadwal() {
  try {
    const res = await fetch(`${URL_JADWAL}?t=${Date.now()}`);

    if (!res.ok) throw new Error("Gagal akses GitHub");

    // PERBAIKAN: Ubah 'response' menjadi 'res' agar sesuai dengan variabel di atas
    const data = await res.json();
    renderJadwal(data.jadwal_pertandingan);
  } catch (err) {
    console.error("Jadwal Error:", err);
    // Tampilkan pesan error jika fetch gagal
    scheduleContainer.innerHTML = `
    <div class="no-schedule reveal visible" style="grid-column: 1/-1; text-align: center; padding: 40px; border: 2px dashed #eee; border-radius: 20px;">
        <span style="font-size: 40px; display: block; margin-bottom: 15px;">⚠️</span>
        <p style="font-weight: bold; margin-bottom: 10px;">Gagal mendapatkan data jadwal.</p>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Silakan cek Instagram kami:</p>
        <a href="https://instagram.com/theblessedballers_jkt" target="_blank" 
        style="background: #1B3FA0; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
        @theblessedballers_jkt
        </a>
    </div>
    `;
  }
}

function renderJadwal(jadwal) {
  scheduleContainer.innerHTML = "";

  if (!jadwal || jadwal.length === 0) {
    scheduleContainer.innerHTML =
      '<div class="no-schedule"><span class="emoji">⚽</span><p>Belum ada jadwal baru.</p></div>';
    return;
  }

  // Ambil tanggal hari ini (set jam ke 00:00:00 agar perbandingan tanggal akurat)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  jadwal.forEach((match) => {
    const dateObj = new Date(match.tanggal);

    // Logika cek apakah jadwal sudah lewat
    const isPast = dateObj < today;

    const namaHari = hariArr[dateObj.getDay()];
    const tgl = dateObj.getDate();
    const namaBulan = bulanArr[dateObj.getMonth()];

    const htmPlayer = match.biaya.htm_player / 1000 + "k";
    const htmKeeper = match.biaya.htm_keeper / 1000 + "k";

    // Tambahkan class 'past-match' jika sudah lewat untuk styling CSS
    const cardHTML = `
        <div class="sched-card reveal ${isPast ? "past-match" : ""}">
            ${isPast ? '<div class="badge-past">Selesai</div>' : '<div class="badge-upcoming">Upcoming</div>'}
            <div class="sched-card-date">
              <div class="date-box" ${isPast ? 'style="background: #94a3b8;"' : ""}>
                  <div class="day-num">${tgl}</div>
                  <div class="month-str">${namaBulan}</div>
              </div>
              <div>
                  <div class="sched-dow">${namaHari}</div>
                  <div class="sched-jam">${match.jam} WIB</div>
              </div>
            </div>
            <div class="sched-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <a href="${match.venue_maps}" target="_blank" rel="noopener noreferrer">${match.venue}</a>
            </div>
            <div class="sched-tags">
              <span class="tag tag-format">${match.format}</span>
              <span class="tag tag-player">Player: ${htmPlayer}</span>
              <span class="tag tag-keeper">Keeper: ${htmKeeper}</span>
            </div>
        </div>
        `;

    scheduleContainer.insertAdjacentHTML("beforeend", cardHTML);
  });

  if (typeof initReveal === "function") {
    initReveal();
  }
}

loadJadwal();
