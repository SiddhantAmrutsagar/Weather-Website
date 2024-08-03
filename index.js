
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const userLocationBtn = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_key = "16ba43c3e3394ec55645daf3eb5f60c9"; // Replace with your OpenWeatherMap API key

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${weatherItem.main.temp}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-condition">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h2>(${weatherItem.dt_txt})</h2>
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-condition">
                    <h4>Temp: ${weatherItem.main.temp}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
};

const getWeatherDetails = async (cityName, lat, lon) => {
    try {
        const weather_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`;
        const response = await axios.get(weather_API_URL);
        const data = response.data;
        
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });
        
        cityInput.value = "";
        weatherCardDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

    } catch (error) {
        alert("An error occurred while fetching the weather details!");
        console.error(error);
    }
};

const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;
    try {
        const response = await axios.get(GEOCODING_API_URL);
        const data = response.data;

        if (!data.length) {
            return alert(`No coordinates found for ${cityName}`);
        }
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    } catch (error) {
        alert("An error occurred while fetching the coordinates!");
        console.error(error);
    }
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        async position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            try {
                const response = await axios.get(REVERSE_GEOCODING_URL);
                const data = response.data;
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);

            } catch (error) {
                alert("An error occurred while fetching your location!");
                console.error(error);
            }            
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permissions to grant access again.");
            }
        }
    );
};

userLocationBtn.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
