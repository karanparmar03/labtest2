import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";

// Styled Components
const AppContainer = styled.div`
  font-family: "Arial", sans-serif;
  min-height: 100vh;
  background: url('/photu.jpeg') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const WeatherContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 800px;
  max-width: 90%;
`;

const LeftBox = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  flex: 1;
`;

const RightBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
`;

const TopBox = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
`;

const BottomBox = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 15px;
  text-align: left;

  p {
    margin: 5px 0;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 20px;
  display: flex;

  input {
    padding: 10px;
    font-size: 16px;
    border-radius: 6px 0 0 6px;
    border: 1px solid #ddd;
    width: 300px;
  }

  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0 6px 6px 0;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

const ForecastContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;

  .forecast-card {
    flex: 1;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: white;

    img {
      width: 50px;
    }

    .forecast-day {
      font-size: 14px;
      font-weight: bold;
    }

    .temp {
      font-size: 18px;
      font-weight: bold;
      color: #007bff;
    }
  }
`;

// App Component
function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("Mumbai");
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`
      );
      setWeatherData(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`
      );

      // Filter forecast data for unique days
      const uniqueDays = forecastResponse.data.list.filter(
        (item, index, self) =>
          self.findIndex((i) => new Date(i.dt * 1000).getDay() === new Date(item.dt * 1000).getDay()) === index
      );

      setForecastData(uniqueDays.slice(0, 7)); // Show Monday to Sunday (max 7 days)
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const handleSearch = () => {
    if (searchCity.trim() !== "") {
      setCity(searchCity);
    }
  };

  return (
    <AppContainer>
      <SearchBar>
        <input
          type="text"
          placeholder="Search for a city"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </SearchBar>

      {loading ? (
        <p>Loading...</p>
      ) : weatherData ? (
        <WeatherContainer>
          <LeftBox>
            <h1>{new Date().toLocaleDateString("en-US", { weekday: "long" })}</h1>
            <h3>{new Date().toLocaleDateString()}</h3>
            <h2>
              {weatherData.name} - {weatherData.sys.country}
            </h2>
            <h1>{Math.round(weatherData.main.temp)}°C</h1>
            <p>{weatherData.weather[0].description}</p>
          </LeftBox>

          <RightBox>
            <TopBox>
              <ForecastContainer>
                {forecastData.map((day) => (
                  <div className="forecast-card" key={day.dt}>
                    <p className="forecast-day">
                      {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                    <img
                      src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt="Weather Icon"
                    />
                    <p className="temp">{Math.round(day.main.temp)}°C</p>
                    <p>{day.weather[0].description}</p>
                  </div>
                ))}
              </ForecastContainer>
            </TopBox>
            <BottomBox>
              <p>UV Index: 8 (Mock Data)</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind: {weatherData.wind.speed} km/h</p>
              <p>Population: {new Intl.NumberFormat().format(23355000)} (Mock Data)</p>
            </BottomBox>
          </RightBox>
        </WeatherContainer>
      ) : (
        <p>Could not fetch weather data.</p>
      )}
    </AppContainer>
  );
}

export default App;
