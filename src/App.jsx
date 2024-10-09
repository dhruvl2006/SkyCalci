import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [weather, setWeather] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState(false);
  const [fetchedData, setFetchedData] = useState({});
  const [dates, setDates] = useState([]);
  const [dataCondition, setDataCondition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const apiKey = "20a3d88dbcaae68abfd7e3f2b8b81a0e";

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const applyWeatherMode = (condition) => {
    if (!isNightTime() && condition.includes("clear")) {
      setWeather("sunny");
    } else if (condition.includes("cloud")) {
      setWeather("cloudy");
    } else if (condition.includes("wind")) {
      setWeather("windy");
    } else if (condition.includes("rain")) {
      setWeather("rainy");
    } else if (isNightTime() && condition.includes("clear")) {
      setWeather("night");
    } else if (
      condition.includes("haze") ||
      condition.includes("fog") ||
      condition.includes("mist")
    ) {
      setWeather("fog");
    } else {
      setWeather("default");
    }
  };

  const displayedDates = new Set();
  const isNightTime = () => {
    if (!currentTime) return false;

    const timeParts = currentTime.split(" ");
    if (timeParts.length !== 2) return false;

    const [time, period] = timeParts;
    const [hourStr, minuteStr] = time.split(":");

    let hour = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minutes)) return false;

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return hour >= 18 || hour < 6;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(false);
    if (!city) {
      setError(true);
      return;
    }
    fetchWeather(city);
  };

  const fetchWeather = async (cityName) => {
    setLoading(true);
    try {
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
      );

      const weatherCondition =
        currentResponse.data.weather[0].main.toLowerCase();

      console.log("Current Weather: ", currentResponse.data);
      console.log("Forecast Weather: ", forecastResponse.data);

      setDataCondition(true);
      setDates(forecastResponse.data.list);
      setFetchedData(currentResponse.data);

      const currentWeatherTime = currentResponse.data.dt;
      const timezoneOffset = currentResponse.data.timezone;

      setCurrentTime(formatTime(currentWeatherTime, timezoneOffset));

      applyWeatherMode(weatherCondition);
    } catch (error) {
      console.error("Error fetching weather data: ", error);
      setError(true);
      setWeather("sunny");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp, timezoneOffset) => {
    const localTime = new Date().getTime();
    const localOffset = new Date().getTimezoneOffset() * 60000;
    const currentUtcTime = localOffset + localTime;
    const cityOffset = currentUtcTime + 1000 * timezoneOffset;
    const cityTime = new Date(cityOffset);

    let hours = cityTime.getHours();
    const minutes = cityTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedTime = `${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${ampm}`;
    return formattedTime;
  };

  const convertTo12HourFormat = (timestamp, timeZone) => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutes} ${period}`;
  };

  const getHours = (timestamp, timeZone) => {
    const date = new Date(timestamp * 1000);
    const options = {
      hour: "numeric",
      hour12: false,
      timeZone: timeZone,
    };

    return parseInt(date.toLocaleString("en-US", options), 10);
  };

  const getDayOfWeek = (dateString) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  return (
    <div className={`weather-app ${weather ? weather : "default"}`}>
      <div className="main">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={handleInputChange}
          />
          <button type="submit">
            <span className="material-symbols-outlined">search</span>
          </button>
        </form>
        <h1 className="header">SkyCalci - Search your City</h1>

        {city === "" ? (
          <div className="search">
            <img src="./seatch-weather.png" alt="" />
            <p>Search a city to get the current weather</p>
          </div>
        ) : error ? (
          <div className="notFound">
            <img src="./404 (1).webp" alt="" />
            <p>City Not Found...!!!</p>
          </div>
        ) : loading ? (
          <div className="loader"></div>
        ) : (
          <>
            {dataCondition && (
              <div className="weather-of-city">
                <div className="info">
                  <div className="one">
                    <div className="temp">
                      <h1>{fetchedData.main.temp}°C</h1>
                      <p>
                        {fetchedData.weather[0].main}:{" "}
                        {fetchedData.weather[0].description}
                      </p>
                    </div>
                    <div className="left-down">
                      <div className="location">
                        <img src="./location.png" width="35px" alt="" />
                        <p>
                          {fetchedData.name}, {fetchedData.sys.country} |{" "}
                          {currentTime}
                        </p>
                      </div>
                      <div className="extra">
                        <p>
                          {fetchedData.main.temp_max}°C /{" "}
                          {fetchedData.main.temp_min}
                          °C Feels like {fetchedData.main.feels_like}°C
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="second">
                    {weather == "sunny" ? (
                      <img src="./sunny.gif" alt="" />
                    ) : weather == "rainy" ? (
                      <img src="./rainy.gif" alt="" />
                    ) : weather == "cloudy" ? (
                      <img src="./cloudy.gif" alt="" />
                    ) : weather == "night" ? (
                      <img src="./night.gif" alt="" />
                    ) : weather == "windy" ? (
                      <img src="./windy.gif" alt="" />
                    ) : weather == "fog" ? (
                      <img src="./foggy.gif" alt="" />
                    ) : (
                      <img src="./sunny.gif" alt="" />
                    )}
                  </div>
                </div>
                <div className="right-side">
                  <div className="weather-temp-info">
                    <div className="weather-features">
                      <img src="./humidity.png" width="40px" alt="" />
                      <p>Humidity</p> <p>{fetchedData.main.humidity}%</p>
                    </div>
                    <div className="weather-features">
                      <img src="./wind.png" width="40px" alt="" />
                      <p>Wind</p> <p>{fetchedData.wind.speed}m/s</p>
                    </div>
                    <div className="weather-features">
                      <img src="./sunrise.png" width="40px" alt="" />
                      <p>Sunrise</p>{" "}
                      <p>
                        {convertTo12HourFormat(
                          fetchedData.sys.sunrise,
                          fetchedData.timeZone
                        )}
                      </p>
                    </div>
                    <div className="weather-features">
                      <img src="./sunset.png" width="40px" alt="" />
                      <p>Sunset</p>{" "}
                      <p>
                        {convertTo12HourFormat(
                          fetchedData.sys.sunset,
                          fetchedData.timeZone
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="dates">
                    {dates.map((response, index) => {
                      const currentDate = getDayOfWeek(response.dt_txt);
                      const hours = getHours(response.dt, response.timeZone);

                      if (displayedDates.has(currentDate)) {
                        return null;
                      }

                      if (12 > hours || hours > 18) {
                        return null;
                      }
                      displayedDates.add(currentDate);

                      return (
                        <div key={index} className="dates-div">
                          <div className="days">
                            <p className="left">{currentDate}</p>
                            <p className="middle">
                              <img src="./humidity.png" width="15" alt="" />{" "}
                              {response.main.humidity}%
                            </p>
                            <p className="right">{response.main.temp}°C</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
