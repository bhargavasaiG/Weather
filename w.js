
let inputEle = document.getElementById("location-input");
let tempEle = document.getElementById("temp-value");
let locEle = document.getElementById("Location"); // Fixed: matching the HTML case
let weatherdescEle = document.getElementById('weather-desc');
let btnEle = document.getElementById('btn');
let iconEle = document.getElementById('icon');

const apiKey = '36350f4ebb381607f5256beaee928a37';

// Function to update weather data
function updateWeather(data) {
    const { name } = data;  // This gets the actual city name from API
    const { feels_like } = data.main;
    const { description, icon } = data.weather[0];  // This gets real weather description
    
    console.log("API Response - City:", name, "Weather:", description);
    
    // Show all weather info elements
    document.querySelector('.temp').style.display = 'block';
    iconEle.style.display = 'block';
    weatherdescEle.style.display = 'block';
    locEle.style.display = 'block';
    
    // Update temperature (convert from Kelvin to Celsius)
    tempEle.innerText = Math.floor(feels_like - 273);
    
    // ✅ Set location to user's searched city (no default text)
    locEle.innerText = name;
    
    // ✅ Set weather description to actual weather (no default text)
    weatherdescEle.innerText = description;
    
    // Update weather icon to match the weather
    iconEle.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    iconEle.alt = description;
    
    console.log("✅ Updated - Location:", locEle.innerText, "Weather:", weatherdescEle.innerText);
}

// Function to handle API errors
function handleError(error) {
    console.error('Error:', error);
    alert("Please enter a valid location");
}

// Alternative: Using JSONP approach or direct API call
// If CORS proxy doesn't work, try this alternative method
function fetchWeatherAlternative(loc) {
    // Method 1: Try direct API call (might work in some browsers)
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${apiKey}&mode=json`;
    
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

// Button click event
btnEle.onclick = function() {
    if (inputEle.value == "") {
        alert("Please enter some location");
    } else {
        // Add loading state
        btnEle.value = "Loading...";
        btnEle.disabled = true;
        
        let loc = inputEle.value;
        
        // Try CORS proxy first, then fallback to direct API
        let url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${apiKey}`)}`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Proxy failed, trying direct API...');
                }
                return res.json();
            })
            .then(response => {
                // Parse the actual weather data from the proxy response
                const data = JSON.parse(response.contents);
                console.log("Weather data:", data);
                
                if (data.cod && data.cod !== 200) {
                    throw new Error(data.message || 'Location not found');
                }
                
                updateWeather(data);
                inputEle.value = "";
            })
            .catch(error => {
                console.log("Proxy failed, trying direct API call...");
                // Fallback to direct API call
                return fetchWeatherAlternative(loc)
                    .then(data => {
                        console.log("Direct API data:", data);
                        updateWeather(data);
                        inputEle.value = "";
                    });
            })
            .catch(error => {
                console.error('All methods failed:', error);
                alert("Unable to fetch weather data. This might be due to CORS restrictions. Please try:\n1. Using a different browser\n2. Running this on a local server\n3. Using the code in a proper web hosting environment");
            })
            .finally(() => {
                // Reset button state
                btnEle.value = "Get Weather";
                btnEle.disabled = false;
            });
    }
}

// Allow Enter key to trigger search
inputEle.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        btnEle.click();
    }
});
