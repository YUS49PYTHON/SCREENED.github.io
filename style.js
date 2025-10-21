const JAMAAH_TIMES = {
  Fajr: "05:00",
  Shurooq: " - -",
  Dhuhr: "13:30",
  Asr: "16:50",
  Maghrib: "18:19",
  Isha: "20:15"
};

let salahTimes = {};
let lastUpdateDate = null;
let salahInProgressUntil = null;
let currentSalahName = null;

async function fetchSalahTimes() {
  try {
    const response = await fetch('http://api.aladhan.com/v1/timingsByCity?city=Leicester&country=UK&method=2');
    const data = await response.json();
    const timings = data.data.timings;
    
    salahTimes = {
      Fajr: timings.Fajr.substring(0, 5),
      Shurooq: timings.Sunrise.substring(0, 5),
      Dhuhr: timings.Dhuhr.substring(0, 5),
      Asr: timings.Asr.substring(0, 5),
      Maghrib: timings.Maghrib.substring(0, 5),
      Isha: timings.Isha.substring(0, 5)
    };
    
    lastUpdateDate = new Date().toDateString();
    renderPrayerTimes();
  } catch (error) {
    console.error('Error fetching salah times:', error);
    salahTimes = {
      Fajr: "N/A",
      Shurooq: "N/A",
      Dhuhr: "N/A",
      Asr: "N/A",
      Maghrib: "N/A",
      Isha: "N/A"
    };
    renderPrayerTimes();
  }
}

function renderPrayerTimes() {
  const container = document.getElementById('prayer-times-list');
  container.innerHTML = '';
  
  const prayers = ['Fajr', 'Shurooq', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  prayers.forEach(prayer => {
    const row = document.createElement('div');
    row.className = 'prayer-row';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'prayer-name';
    nameSpan.textContent = prayer;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'prayer-time';
    timeSpan.textContent = salahTimes[prayer] || ' - -';
    
    const jamaahSpan = document.createElement('span');
    jamaahSpan.className = 'jamaah-time';
    jamaahSpan.textContent = JAMAAH_TIMES[prayer];
    
    row.appendChild(nameSpan);
    row.appendChild(timeSpan);
    row.appendChild(jamaahSpan);
    container.appendChild(row);
  });
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
  
  const currentDate = now.toDateString();
  if (lastUpdateDate !== currentDate) {
    fetchSalahTimes();
  }
}

function checkJamaahWarning() {
  const now = new Date();
  const prayers = ['Fajr', 'Shurooq', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  let warningShown = false;
  
  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];
    const jamaahTime = JAMAAH_TIMES[prayer];
    
    if (!jamaahTime || jamaahTime.trim() === '- -' || jamaahTime.trim() === '--' || jamaahTime.trim() === '') {
      continue;
    }
    
    try {
      const [hours, minutes] = jamaahTime.split(':').map(Number);
      let jamaahDate = new Date(now);
      jamaahDate.setHours(hours, minutes, 0, 0);
      
      if (jamaahDate < now) {
        jamaahDate.setDate(jamaahDate.getDate() + 1);
      }
      
      const timeDiff = (jamaahDate - now) / 1000;
      
      const salahStartTime = new Date(jamaahDate);
      if (salahStartTime.getDate() > now.getDate()) {
        salahStartTime.setDate(salahStartTime.getDate() - 1);
      }
      
      const timeSinceSalahStart = (now - salahStartTime) / 1000;
      
      if (timeSinceSalahStart >= 0 && timeSinceSalahStart < 480) {
        salahInProgressUntil = new Date(salahStartTime.getTime() + 480000);
        currentSalahName = prayer;
        return true;
      }
      
      if (timeDiff > 0 && timeDiff <= 600) {
        const mins = Math.floor(timeDiff / 60);
        const secs = Math.floor(timeDiff % 60);
        const warningBanner = document.getElementById('warning-banner');
        warningBanner.textContent = `${prayer} Jamaat in ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} minutes`;
        warningBanner.classList.remove('hidden');
        warningShown = true;
        break;
      }
    } catch (error) {
      console.error(`Error processing ${prayer}:`, error);
      continue;
    }
  }
  
  if (!warningShown) {
    document.getElementById('warning-banner').classList.add('hidden');
  }
  
  return false;
}

function showSalahScreen() {
  const salahScreen = document.getElementById('salah-screen');
  const salahText = document.getElementById('salah-text');
  const mainContent = document.getElementById('main-content');
  const warningBanner = document.getElementById('warning-banner');
  
  const arabicText = "إِنَّ الصَّلاَةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَاباً مَّوْقُوتاً";
  const englishText = "Indeed, prayer has been decreed upon the believers a decree of specified times";
  
  const secondsElapsed = Math.floor(Date.now() / 1000);
  const showArabic = Math.floor(secondsElapsed / 15) % 2 === 0;
  
  if (showArabic) {
    salahText.textContent = arabicText;
    salahText.className = 'arabic';
  } else {
    salahText.textContent = englishText;
    salahText.className = 'english';
  }
  
  salahScreen.classList.remove('hidden');
  mainContent.classList.add('hidden');
  warningBanner.classList.add('hidden');
}

function hideSalahScreen() {
  const salahScreen = document.getElementById('salah-screen');
  const mainContent = document.getElementById('main-content');
  
  salahScreen.classList.add('hidden');
  mainContent.classList.remove('hidden');
}

function mainLoop() {
  updateClock();
  
  const now = new Date();
  
  if (salahInProgressUntil && now < salahInProgressUntil) {
    showSalahScreen();
  } else {
    if (salahInProgressUntil && now >= salahInProgressUntil) {
      salahInProgressUntil = null;
      currentSalahName = null;
      hideSalahScreen();
    }
    
    const isSalahTime = checkJamaahWarning();
    if (isSalahTime) {
      showSalahScreen();
    }
  }
}

fetchSalahTimes();
setInterval(mainLoop, 1000);
mainLoop();
