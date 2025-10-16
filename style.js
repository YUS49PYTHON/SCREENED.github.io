// Define prayer times
const prayerTimes = {
    Fajr: "05:00",
    Shurooq: " - -",
    Dhuhr: "13:30",
    Asr: "16:50",
    Maghrib: "18:19",
    Isha: "20:15"
  };
  
  // Get the container for displaying prayer times
  const prayerTimesContainer = document.getElementById("prayer-times");
  
  // Display each prayer time dynamically
  for (const [prayer, time] of Object.entries(prayerTimes)) {
    const div = document.createElement("div");
    div.className = "prayer-time";
    div.textContent = `${prayer}: ${time}`;
    prayerTimesContainer.appendChild(div);
  }
