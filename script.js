/* ========================================= */
/* OPEN WEATHER API */
/* ========================================= */

const API_KEY = "bd5e378503939ddaee76f12ad7a97608";

const CURRENT_WEATHER_API =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
  "https://api.openweathermap.org/data/2.5/forecast";

/* ========================================= */
/* DOM ELEMENTS */
/* ========================================= */

const searchInput = document.getElementById("searchInput");
const locationBtn = document.getElementById("locationBtn");

const temperature = document.getElementById("temperature");
const cityName = document.getElementById("cityName");
const weatherCondition = document.getElementById("weatherCondition");
const dateTime = document.getElementById("dateTime");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const uvIndex = document.getElementById("uvIndex");
const feelsLike = document.getElementById("feelsLike");
const visibility = document.getElementById("visibility");

const recentSearches = document.getElementById("recentSearches");
const recentSearchList = document.getElementById("recentSearchList");
const clearRecentBtn = document.getElementById("clearRecentBtn");

const errorPopup = document.getElementById("errorPopup");
const errorMessage = document.getElementById("errorMessage");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

/* ========================================= */
/* GLOBAL VARIABLES */
/* ========================================= */

let currentUnit = "metric";

/* ========================================= */
/* WINDOW LOAD */
/* ========================================= */

window.addEventListener("load", () => {

  updateDateTime();

  loadRecentSearches();

  getWeatherByCity("Bhubaneswar");

});

/* ========================================= */
/* SEARCH EVENT */
/* ========================================= */

searchInput.addEventListener("keypress", (event) => {

  if (event.key === "Enter") {

    const city = searchInput.value.trim();

    if (city === "") {

      showError("Please enter a city name");

      return;

    }

    getWeatherByCity(city);

    searchInput.value = "";

  }

});

/* ========================================= */
/* LOCATION BUTTON */
/* ========================================= */

locationBtn.addEventListener("click", () => {

  if (!navigator.geolocation) {

    showError("Geolocation is not supported");

    return;

  }

  navigator.geolocation.getCurrentPosition(

    (position) => {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      getWeatherByCoordinates(latitude, longitude);

    },

    () => {

      showError("Unable to fetch your location");

    }

  );

});

/* ========================================= */
/* TEMPERATURE TOGGLE */
/* ========================================= */

celsiusBtn.addEventListener("click", () => {

  if (currentUnit === "metric") return;

  currentUnit = "metric";

  celsiusBtn.classList.add("active-temp");
  fahrenheitBtn.classList.remove("active-temp");

  const city = cityName.innerText.split(",")[0];

  getWeatherByCity(city);

});

fahrenheitBtn.addEventListener("click", () => {

  if (currentUnit === "imperial") return;

  currentUnit = "imperial";

  fahrenheitBtn.classList.add("active-temp");
  celsiusBtn.classList.remove("active-temp");

  const city = cityName.innerText.split(",")[0];

  getWeatherByCity(city);

});

/* ========================================= */
/* FETCH WEATHER BY CITY */
/* ========================================= */

async function getWeatherByCity(city) {

  try {

    const response = await fetch(
      `${CURRENT_WEATHER_API}?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    );

    if (!response.ok) {

      throw new Error("City not found");

    }

    const data = await response.json();

    updateCurrentWeather(data);

    saveRecentSearch(city);

    getForecast(city);

  }

  catch (error) {

    showError(error.message);

  }

}

/* ========================================= */
/* FETCH WEATHER BY COORDINATES */
/* ========================================= */

async function getWeatherByCoordinates(lat, lon) {

  try {

    const response = await fetch(
      `${CURRENT_WEATHER_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
    );

    if (!response.ok) {

      throw new Error("Unable to fetch weather");

    }

    const data = await response.json();

    updateCurrentWeather(data);

    saveRecentSearch(data.name);

    getForecast(data.name);

  }

  catch (error) {

    showError(error.message);

  }

}

/* ========================================= */
/* UPDATE CURRENT WEATHER UI */
/* ========================================= */

function updateCurrentWeather(data) {

  temperature.innerText =
    `${Math.round(data.main.temp)}°`;

  cityName.innerText =
    `${data.name}, ${data.sys.country}`;

  weatherCondition.innerText =
    data.weather[0].main;

  humidity.innerText =
    `${data.main.humidity}%`;

  windSpeed.innerText =
    `${Math.round(data.wind.speed)} ${
      currentUnit === "metric"
        ? "km/h"
        : "mph"
    }`;

  pressure.innerText =
    `${data.main.pressure} mb`;

  feelsLike.innerText =
    `${Math.round(data.main.feels_like)}°`;

  visibility.innerText =
    `${(data.visibility / 1000).toFixed(1)} km`;

  uvIndex.innerText =
    "Moderate";

  updateDateTime();

  updateBackground(data.weather[0].main);

  checkExtremeTemperature(data.main.temp);

}

/* ========================================= */
/* DATE & TIME */
/* ========================================= */

function updateDateTime() {

  const now = new Date();

  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };

  dateTime.innerText =
    now.toLocaleDateString("en-US", options);

}

/* ========================================= */
/* GET 5-DAY FORECAST */
/* ========================================= */

async function getForecast(city) {

  try {

    const response = await fetch(
      `${FORECAST_API}?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    );

    if (!response.ok) {

      throw new Error("Forecast data unavailable");

    }

    const data = await response.json();

    updateForecastUI(data.list);

  }

  catch (error) {

    console.log(error);

  }

}

/* ========================================= */
/* UPDATE FORECAST UI */
/* ========================================= */

function updateForecastUI(forecastData) {

  const forecastCards =
    document.querySelector(".forecast-cards");

  forecastCards.innerHTML = "";

  const filteredForecast =
    forecastData.filter(item =>
      item.dt_txt.includes("12:00:00")
    );

  filteredForecast.slice(0, 5).forEach((item, index) => {

    const date = new Date(item.dt_txt);

    const dayName =
      index === 0
        ? "Today"
        : date.toLocaleDateString("en-US", {
            weekday: "short"
          });

    const icon =
      `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    const card = document.createElement("div");

    card.classList.add("forecast-card");

    card.innerHTML = `

      <h3>${dayName}</h3>

      <img src="${icon}" alt="Weather Icon">

      <div class="forecast-temp">

        <span class="max-temp">
          ${Math.round(item.main.temp_max)}°
        </span>

        <span class="min-temp">
          ${Math.round(item.main.temp_min)}°
        </span>

      </div>

      <div class="forecast-extra">

        <div class="forecast-info">

          <div class="forecast-label">

            <i class="fa-solid fa-droplet"></i>

            <span>Humidity</span>

          </div>

          <span>
            ${item.main.humidity}%
          </span>

        </div>

        <div class="forecast-info">

          <div class="forecast-label">

            <i class="fa-solid fa-wind"></i>

            <span>Wind</span>

          </div>

          <span>

            ${Math.round(item.wind.speed)}

            ${
              currentUnit === "metric"
                ? "km/h"
                : "mph"
            }

          </span>

        </div>

      </div>

    `;

    forecastCards.appendChild(card);

  });

}

/* ========================================= */
/* SAVE RECENT SEARCHES */
/* ========================================= */

function saveRecentSearch(city) {

  let searches =
    JSON.parse(localStorage.getItem("recentCities")) || [];

  searches = searches.filter(item =>
    item.toLowerCase() !== city.toLowerCase()
  );

  searches.unshift(city);

  searches = searches.slice(0, 5);

  localStorage.setItem(
    "recentCities",
    JSON.stringify(searches)
  );

  loadRecentSearches();

}

/* ========================================= */
/* LOAD RECENT SEARCHES */
/* ========================================= */

function loadRecentSearches() {

  const searches =
    JSON.parse(localStorage.getItem("recentCities")) || [];

  recentSearchList.innerHTML = "";

  if (searches.length === 0) {

    recentSearches.classList.add("hidden");

    return;

  }

  recentSearches.classList.remove("hidden");

  searches.forEach((city) => {

    const listItem = document.createElement("li");

    listItem.innerHTML = `
    
      <i class="fa-solid fa-location-dot"></i>
      <span>${city}</span>

    `;

    listItem.addEventListener("click", () => {

      getWeatherByCity(city);

    });

    recentSearchList.appendChild(listItem);

  });

}

/* ========================================= */
/* CLEAR RECENT SEARCHES */
/* ========================================= */

clearRecentBtn.addEventListener("click", () => {

  localStorage.removeItem("recentCities");

  loadRecentSearches();

});

/* ========================================= */
/* ERROR HANDLING */
/* ========================================= */

function showError(message) {

  errorMessage.innerText = message;

  errorPopup.classList.remove("hidden");

  setTimeout(() => {

    errorPopup.classList.add("hidden");

  }, 3000);

}

/* ========================================= */
/* EXTREME TEMPERATURE ALERT */
/* ========================================= */

function checkExtremeTemperature(temp) {

  if (
    currentUnit === "metric" &&
    temp >= 40
  ) {

    showError("Extreme Heat Alert Above 40°C");

  }

}

/* ========================================= */
/* DYNAMIC BACKGROUND */
/* ========================================= */

function updateBackground(weatherType) {

  weatherType = weatherType.toLowerCase();

  if (weatherType.includes("clear")) {

    document.body.style.background = `
    
      linear-gradient(
        135deg,
        rgba(255,180,80,0.45),
        rgba(0,76,173,0.65)
      ),

      url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop")

    `;

  }

  else if (weatherType.includes("cloud")) {

    document.body.style.background = `
    
      linear-gradient(
        135deg,
        rgba(120,120,120,0.45),
        rgba(30,60,114,0.7)
      ),

      url("https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2070&auto=format&fit=crop")

    `;

  }

  else if (
    weatherType.includes("rain") ||
    weatherType.includes("drizzle")
  ) {

    document.body.style.background = `
    
      linear-gradient(
        135deg,
        rgba(20,20,20,0.55),
        rgba(0,40,80,0.75)
      ),

      url("https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2070&auto=format&fit=crop")

    `;

  }

  else if (weatherType.includes("thunderstorm")) {

    document.body.style.background = `
    
      linear-gradient(
        135deg,
        rgba(10,10,10,0.7),
        rgba(30,30,60,0.8)
      ),

      url("https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=2070&auto=format&fit=crop")

    `;

  }

  else if (
    weatherType.includes("mist") ||
    weatherType.includes("fog") ||
    weatherType.includes("haze")
  ) {

    document.body.style.background = `
    
      linear-gradient(
        135deg,
        rgba(120,120,120,0.5),
        rgba(50,50,50,0.65)
      ),

      url("https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80&w=2070&auto=format&fit=crop")

    `;

  }

  else {

    document.body.style.background = `
    
      linear-gradient(
        135deg,
        rgba(90,90,90,0.45),
        rgba(0,50,90,0.65)
      ),

      url("https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=2070&auto=format&fit=crop")

    `;

  }

  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";

}