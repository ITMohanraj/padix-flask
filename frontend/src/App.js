import React, { useState, useEffect } from 'react';
import './App.css';  // Import CSS file for styling

const App = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState({});
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        if (Object.keys(weatherData).length > 0) {
            const firstDate = Object.keys(weatherData)[0];
            setSelectedDate(firstDate);
        }
    }, [weatherData]);

    const fetchWeather = async () => {
        if (!city.trim()) return alert("Please enter a city name.");
        try {
            const response = await fetch(`https://weather-app-r7fs.onrender.com/weather?city=${encodeURIComponent(city)}`);
            if (!response.ok) {
                const err = await response.json();
                alert(err.error || 'Failed to fetch weather');
                return;
            }
            const data = await response.json();
            setWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data');
        }
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const getWeatherDetailsForDay = (forecasts) => {
        let weatherAtNoon = forecasts.find(f => f.time === '12:00:00');
        if (!weatherAtNoon) {
            weatherAtNoon = forecasts[forecasts.length - 1];
        }
        const weatherIcon = getWeatherIcon(weatherAtNoon.weather);
        return {
            temp: weatherAtNoon.temp,
            weather: weatherAtNoon.weather,
            icon: weatherIcon
        };
    };

    const getWeatherIcon = (weather) => {
        if (weather.toLowerCase().includes('clear')) return '☀️';
        if (weather.toLowerCase().includes('cloud')) return '☁️';
        if (weather.toLowerCase().includes('rain')) return '🌧️';
        return '❓';
    };

    const formatDate = (dateString) => {
        const [, month, day] = dateString.split('-');
        return `${month}/${day}`;
    };

    const getDayOfWeek = (dateString) => {
        const date = new Date(`${dateString}T00:00:00`);
        return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    };

    return (
        <div className="app">
            <div className="container">
                {/* Info Button */}
                <button className="info-button" onClick={toggleDropdown}>
                    Info
                </button>
                {dropdownVisible && (
                    <div className="dropdown">
                        <p>
                            The Product Manager Accelerator Program is designed to support PM professionals through every stage of their career.
                            From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped hundreds
                            fulfill their career aspirations.
                        </p>
                    </div>
                )}

                {/* Header Section */}
                <header className="top">
                    <h1>Weather App by Emile Eid</h1>
                </header>

                {/* Location Input Section */}
                <div className="location">
                    <input 
                        type="text" 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        placeholder="Enter City" 
                    />
                    <button onClick={fetchWeather}>Get Weather</button>
                </div>

                {/* Weather Display Section */}
                <div className="middle">
                    {weatherData[selectedDate] && (
                        <div className="weather-display">
                            <div className="current-weather">
                                <h2>{getDayOfWeek(selectedDate)} {formatDate(selectedDate)}</h2>
                                <div className="current-temp">
                                    {getWeatherDetailsForDay(weatherData[selectedDate]).temp}°F
                                </div>
                                <div className="current-temp">
                                    {getWeatherDetailsForDay(weatherData[selectedDate]).weather}
                                    {getWeatherDetailsForDay(weatherData[selectedDate]).icon}
                                </div>
                            </div>

                            <div className="forecast-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Temperature (°F)</th>
                                            <th>Feels Like (°F)</th>
                                            <th>Humidity (%)</th>
                                            <th>Wind (mph)</th>
                                            <th>Weather</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weatherData[selectedDate].map((forecast, index) => (
                                            <tr key={index}>
                                                <td>{forecast.time}</td>
                                                <td>{forecast.temp}°F</td>
                                                <td>{forecast.feels_like}°F</td>
                                                <td>{forecast.humidity}%</td>
                                                <td>{forecast.wind_s} mph {forecast.wind_d}</td>
                                                <td>{forecast.weather} {getWeatherIcon(forecast.weather)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Navigation Section */}
                <div className="bottom">
                    {Object.keys(weatherData).map((date) => {
                        const forecasts = weatherData[date];
                        const { temp, icon } = getWeatherDetailsForDay(forecasts);
                        return (
                            <button 
                                key={date} 
                                className="date-button" 
                                onClick={() => handleDateChange(date)}
                            >
                                {getDayOfWeek(date)} {formatDate(date)}
                                <br />
                                {temp}°F {icon}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default App;
