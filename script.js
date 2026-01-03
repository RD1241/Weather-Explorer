const apiKey = "c94e06f177790c831bd804f83f10c7d7";
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');

// --- Search Handlers ---
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value;
    if (city) {
        searchBtn.innerText = "...";
        await getWeather(city);
        await getForecast(city);
        searchBtn.innerText = "Search";
    } else {
        alert("Please enter a city name");
    }
});

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            getWeatherByCoords(latitude, longitude);
            getForecastByCoords(latitude, longitude);
        });
    }
});

// --- API Calls ---
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    await fetchData(url, displayWeather);
}

async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    await fetchData(url, displayForecast);
}

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    await fetchData(url, displayWeather);
}

async function getForecastByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    await fetchData(url, displayForecast);
}

// Helper to handle fetch errors
async function fetchData(url, callback) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod == "404") {
            alert("Location not found");
        } else {
            callback(data);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// --- Display UI ---
function displayWeather(data) {
    const weatherMain = data.weather[0].main.toLowerCase();
    const body = document.body;

    body.classList.remove('sunny-bg', 'rainy-bg', 'cloudy-bg');
    if (weatherMain.includes('cloud')) body.classList.add('cloudy-bg');
    else if (weatherMain.includes('rain')) body.classList.add('rainy-bg');
    else if (weatherMain.includes('clear')) body.classList.add('sunny-bg');

    document.getElementById('weather-display').classList.remove('hidden');
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('temperature').innerHTML = `${Math.round(data.main.temp)}&deg;C`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('wind-speed').innerText = `${data.wind.speed} km/h`;
    
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

function displayForecast(data) {
    const list = document.getElementById('forecast-list');
    document.getElementById('forecast-container').classList.remove('hidden');
    list.innerHTML = '';

    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en', {weekday: 'short'});
        list.innerHTML += `
            <div class="forecast-card">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p><b>${Math.round(day.main.temp)}&deg;</b></p>
            </div>
        `;
    });
}