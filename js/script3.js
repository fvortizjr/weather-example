document.addEventListener("DOMContentLoaded", function() {
    const forecastDiv = document.getElementById("dcforecasts");
    const weather_api_url = 'https://api.weather.gov/points/';
    const latest_prefix_url = 'https://api.weather.gov/stations/'
   
    fetch('locations.json')
        .then(response => {
            if(!response.ok) { throw new Error("HTTP error " + response.status); } return response.json();
        })
        .then(data => {
            const locations = data;
            //console.log(data);
            locations.forEach(dc => {
                const url = weather_api_url + dc.latlong;
                const tempDC = document.getElementById(dc.name);
                //console.log(tempDC); console.log(url);
                fetch(url)
                .then(response => response.json())
                .then(data => {
                    const forecastUrl = data.properties.forecast;
                    fetch(data.properties.observationStations)
                        .then(response => {
                            if(!response.ok) { throw new Error("HTTP error " + response.status) } return response.json();
                        })
                        .then(stations => {
                            const stationID = stations.features[0].properties.stationIdentifier;
                            currentTempUrl = latest_prefix_url + stationID + "/observations/latest";                            
                            fetch(currentTempUrl)
                                .then(response => {
                                    if(!response.ok) { throw new Error("HTTP error " + response.status) } return response.json();
                                })
                                .then(latesttemp => {
                                    const celtemp = latesttemp.properties.temperature.value;
                                    var z = (celtemp * (9/5)) + 32;
                                    z = ~~z;
                                    tempDC.innerHTML += `<h5>` + dc.name + ` - ` + dc.abbrev + `</h5>`;
                                    tempDC.innerHTML += `Thresholds<br />`;
                                    tempDC.innerHTML += `high: ` + dc.setpoints[0] + `| low: ` + dc.setpoints[1] + `<br />`;
                                    tempDC.innerHTML += `<strong>Current</strong>: <font color="black">${z}°F</font>`;
                                    tempDC.innerHTML += `<br />`;
                                    fetch(forecastUrl)
                                        .then(response => response.json())
                                        .then(forecast => {
                                            const dailyForecasts = forecast.properties.periods;                                    
                                            var highlows = [];
                                            dailyForecasts.forEach(hl =>{
                                                if(dailyForecasts[0].name == "This Afternoon") {
                                                    if(hl.isDaytime) { var obj = { 'High': hl.temperature } } else { var obj = { 'Low': hl.temperature } } highlows.push(obj);
                                                } else if(dailyForecasts[0].name == "Tonight") {
                                                    if(!hl.isDaytime) { var obj = { 'Low': hl.temperature } } else { var obj = { 'High': hl.temperature } } highlows.push(obj);
                                                } else {}
                                            })
                                            console.log(dc.name); console.log(url); console.log(highlows);
                                            var i = 0; var j = 1; var f = 0;
                                            while (f < 7) {
                                                const date = new Date(dailyForecasts[i].startTime);
                                                const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                                                const md = new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit" }).format(date);
                                                let dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
                                                const temperature = dailyForecasts[f].temperature;
                                                var tempcolor = "black";
                                                //console.log(dayOfWeek);
                                                if(highlows[i].High >= dc.setpoints[0]) { tempcolor = "red"; } else if(highlows[j].Low <= dc.setpoints[1]) { tempcolor = "blue"; } else { tempcolor = "black"; }                                                
                                                if(dailyForecasts[0].isDaytime) {
                                                    if(dayOfWeek == today) {
                                                        dayOfWeek = "Today";
                                                        tempDC.innerHTML += `<strong>${md} - ${dayOfWeek}</strong>: <strong>High</strong> <font color=${tempcolor}>${highlows[i].High}°F / </font><strong>Low</strong> <font color=${tempcolor}>${highlows[j].Low}°F </font>`;
                                                    } else {
                                                        tempDC.innerHTML += `<strong>${md} - ${dayOfWeek}</strong>: <strong>High</strong> <font color=${tempcolor}>${highlows[i].High}°F / </font><strong>Low</strong> <font color=${tempcolor}>${highlows[j].Low}°F </font>`;
                                                    }                                                                                
                                                } else {
                                                    if(dayOfWeek == today) {
                                                        dayOfWeek = "Tonight";
                                                        tempDC.innerHTML += `<strong>Low</strong><font color=${tempcolor}>${highlows[i].Low}°F </font>`;
                                                    } else {
                                                        tempDC.innerHTML += `<strong>${md} - ${dayOfWeek}</strong>: <strong>High</strong> <font color=${tempcolor}>${highlows[j-2].High}°F / </font><strong>Low</strong> <font color=${tempcolor}>${highlows[i].Low}°F </font>`;
                                                    }                                                      
                                                }                                   
                                                tempDC.innerHTML += `<br />`;
                                                i += 2; j += 2; f++;
                                            }
                                    })
                                })
                        })
                    
                })
            })
        })        
        .catch(error => {
            console.error("Error fetching forecast:", error);
            forecastDiv.innerHTML = "Failed to fetch forecast data.";
        })
    
    function updateDateTime() { const now = new Date(); document.querySelector('#bottomrow').textContent = now.toLocaleString() + ` page auto refreshes every hour!`; }
    function reLoad() { location.reload(); }
    setInterval(updateDateTime, 1000);
    setInterval(reLoad, 3.6e+6);    
});