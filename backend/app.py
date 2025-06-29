from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import requests
import os

# Serve React from the build folder
app = Flask(__name__, static_folder="frontend", static_url_path="/")
CORS(app)

# Get API key from environment or fallback for local dev
API_KEY = os.getenv("OPENWEATHER_API_KEY", "7ab913b9dd0a1ad7ceffa0e402f0e81b")

def get_wind_direction(wd):
    directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    idx = int((wd + 22.5) // 45) % 8
    return directions[idx]

def preprocess_data(forecast):
    data = forecast.get('list', [])
    if not data:
        return {}

    daily_data = {}
    for entry in data:
        dt_txt = entry['dt_txt']
        date, time = dt_txt.split()

        weather_data = {
            'time': time,
            'weather': entry['weather'][0]['main'],
            'temp': entry['main']['temp'],
            'feels_like': entry['main']['feels_like'],
            'humidity': entry['main']['humidity'],
            'wind_s': entry['wind']['speed'],
            'wind_d': get_wind_direction(entry['wind']['deg']),
        }

        if date not in daily_data:
            daily_data[date] = []
        daily_data[date].append(weather_data)

    return daily_data

# React frontend route
@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

# Weather API route
@app.route('/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    try:
        url = f'https://api.openweathermap.org/data/2.5/forecast?q={city}&units=imperial&appid={API_KEY}'
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({'error': 'City not found'}), 404

        data = response.json()
        processed_data = preprocess_data(data)
        return jsonify(processed_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Catch-all route to serve index.html for React Router
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

# Start server
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port, host='0.0.0.0')
