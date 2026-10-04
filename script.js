// ---------- Weather code -> text + emoji (WMO codes used by Open-Meteo) ----------
const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌧️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Light showers", "🌦️"],
  81: ["Showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  85: ["Snow showers", "🌨️"],
  86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with hail", "⛈️"]
};
const lookup = (code) => WEATHER_CODES[code] || ["Unknown", "❔"];

// ---------- State ----------
let unit = "celsius";           // "celsius" or "fahrenheit"
let lastPlace = null;           // { name, latitude, longitude }

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const form = $("searchForm");
const cityInput = $("cityInput");
const searchBtn = $("searchBtn");
const locBtn = $("locBtn");
const unitBtn = $("unitBtn");
const messageEl = $("message");

function setMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  locBtn.disabled = isLoading;
  if (isLoading) setMessage("Loading weather...");
}

// ---------- API calls (Open-Meteo: free, no API key) ----------
async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not look up that city. Try again.");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No city found for "${city}". Check the spelling.`);
  }
  const r = data.results[0];
  const name = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
  return { name, latitude: r.latitude, longitude: r.longitude };
}

async function reverseName(lat, lon) {
  // Open-Meteo has no reverse geocoding, so use a free one; fall back to coordinates.
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) throw new Error();
    const d = await res.json();
    const name = [d.city || d.locality, d.principalSubdivision, d.countryName]
      .filter(Boolean).join(", ");
    return name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

async function fetchWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    temperature_unit: unit,
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "5"
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("Weather service is not responding. Try again.");
  return res.json();
}

// ---------- Rendering ----------
function render(place, data) {
  const sym = unit === "celsius" ? "°C" : "°F";
  const c = data.current;
  const [text, emoji] = lookup(c.weather_code);

  $("place").textContent = place.name;
  $("icon").textContent = emoji;
  $("temp").textContent = `${Math.round(c.temperature_2m)}${sym}`;
  $("desc").textContent = text;
  $("feels").textContent = `${Math.round(c.apparent_temperature)}${sym}`;
  $("humidity").textContent = `${c.relative_humidity_2m}%`;
  $("wind").textContent = `${Math.round(c.wind_speed_10m)} km/h`;
  $("pressure").textContent = `${Math.round(c.surface_pressure)} hPa`;

  const d = data.daily;
  $("forecast").innerHTML = d.time.map((date, i) => {
    const dayName = i === 0
      ? "Today"
      : new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
    const [dText, dEmoji] = lookup(d.weather_code[i]);
    return `
      <div class="day" title="${dText}">
        <div>${dayName}</div>
        <div class="d-icon">${dEmoji}</div>
        <div class="hi">${Math.round(d.temperature_2m_max[i])}°</div>
        <div class="lo">${Math.round(d.temperature_2m_min[i])}°</div>
      </div>`;
  }).join("");

  $("current").classList.remove("hidden");
  $("forecast").classList.remove("hidden");
  setMessage("");
}

async function showWeather(place) {
  setLoading(true);
  try {
    const data = await fetchWeather(place);
    lastPlace = place;
    render(place, data);
  } catch (err) {
    setMessage(err.message || "Something went wrong.", true);
  } finally {
    searchBtn.disabled = false;
    locBtn.disabled = false;
  }
}

// ---------- Events ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    setMessage("Enter a city name to search.", true);
    return;
  }
  setLoading(true);
  try {
    const place = await geocode(city);
    await showWeather(place);
  } catch (err) {
    setMessage(err.message || "Something went wrong.", true);
    searchBtn.disabled = false;
    locBtn.disabled = false;
  }
});

locBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setMessage("Your browser does not support location. Search for a city instead.", true);
    return;
  }
  setLoading(true);
  setMessage("Getting your location...");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const name = await reverseName(latitude, longitude);
      showWeather({ name, latitude, longitude });
    },
    (err) => {
      searchBtn.disabled = false;
      locBtn.disabled = false;
      const msg = err.code === 1
        ? "Location access was blocked. Allow it in your browser, or search for a city."
        : "Could not get your location. Search for a city instead.";
      setMessage(msg, true);
    },
    { timeout: 10000 }
  );
});

unitBtn.addEventListener("click", () => {
  unit = unit === "celsius" ? "fahrenheit" : "celsius";
  unitBtn.textContent = unit === "celsius" ? "Switch to °F" : "Switch to °C";
  if (lastPlace) showWeather(lastPlace);
});

// Load a default city on start so the page is never empty
showWeather({ name: "Bengaluru, Karnataka, India", latitude: 12.9716, longitude: 77.5946 });