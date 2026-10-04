# Weather App

A responsive weather web app that shows current conditions and a 5-day forecast for any city or for the user's current location.

Built as **Task-05** of the Web Development internship at **Prodigy InfoTech**.

## Features

- Search weather by city name
- Detect the user's location with the browser's Geolocation API
- Current temperature, weather condition, "feels like", humidity, wind speed and pressure
- 5-day forecast with daily high and low
- Switch between °C and °F
- Clear error messages (city not found, location blocked, no internet)
- Responsive layout for desktop and mobile

## Tech Stack

- HTML5
- CSS3 (Grid, Flexbox, CSS variables, media queries)
- JavaScript (ES6+, `fetch`, `async/await`, DOM manipulation)
- [Open-Meteo API](https://open-meteo.com/): free, no API key required

## How It Works

1. The user types a city name, or clicks **Use my location**.
2. For a city name, the app calls the Open-Meteo **Geocoding API** to get latitude and longitude. For location, it uses `navigator.geolocation`.
3. The app calls the Open-Meteo **Forecast API** with those coordinates.
4. The JSON response is read and shown on the page. Weather codes are mapped to a description and an emoji.

## Project Structure

```
weather-app/
├── index.html    # Page structure
├── style.css     # Styling and responsive layout
├── script.js     # API calls and page logic
└── README.md
```

## Run Locally

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   ```
2. Open the folder and double-click `index.html`, or use the VS Code **Live Server** extension.

> Note: the "Use my location" button only works on `https://` or `localhost`, so use Live Server or the live demo to test it.

## API Reference

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- Reverse geocoding (place name for GPS): `https://api.bigdatacloud.net/data/reverse-geocode-client`

## Acknowledgements

- [Prodigy InfoTech](https://prodigyinfotech.dev/) for the internship task
- [Open-Meteo](https://open-meteo.com/) for the free weather data
