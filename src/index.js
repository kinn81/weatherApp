import { utcToZonedTime } from "date-fns-tz";
import "./styles.css";
import rainIcon from "./rain.svg";
import cloudIcon from "./cloud.svg";
import sunIcon from "./sun.svg";
import minusIcon from "./minus.svg";

//HTML element variables
const searchButton = document.querySelector("#search");
const input = document.querySelector("#input");
const city = document.querySelector("#location");
const cTemp = document.querySelector("#cTemp");
const cWeather = document.querySelector("#cWeather");
const forecastCont = document.querySelector("#forecastContainer");
const units = "metric";

//Date baseline variables
let today;
let tomorrow;
let dayAfter;

//Day of week mapping
const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

//Forecast mapping
const rain = "/thunderstorm|storm|drizzle|rain|snow/";
const cloud = "/clouds/";
const clear = "/clear/";

//Object to hold 3-day weather forecast
let forecast;

//Search on enter pressed
input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
});

//Execute search when button pressed
searchButton.onclick = () => {
  if (input.value.length > 0) {
    getCurrentWeather(input.value)
      .then(function (result) {
        city.textContent = input.value;
        cTemp.textContent = result.main.temp;

        cWeather.textContent = result.weather[0].main;
      })
      .catch(handleErrors);
  }

  getWeatherForecast(input.value)
    .then(function (result) {
      handleForecastResponse(result);
      displayForecast();
    })
    .catch(handleErrors);
};

//Up to here... needs to get this working!
function forecastMap(forecast) {
  if (forecast.toLowerCase().match(/thunderstorm|storm|drizzle|rain|snow/)) {
    return rainIcon;
  } else if (forecast.toLowerCase().match(/cloud/)) {
    return cloudIcon;
  } else if (forecast.toLowerCase().match(/rain|storm|drizzle/)) {
    return sunIcon;
  } else if (forecast.toLowerCase().match(/minus/)) {
    return minusIcon;
  }
}

function displayForecast() {
  let fcElements = forecastCont.children;
  for (let i = 0; i < fcElements.length; i++) {
    let child = fcElements[i].lastElementChild;
    while (child) {
      fcElements[i].removeChild(child);
      child = fcElements[i].lastElementChild;
    }
  }

  fcElements[0].textContent = weekday[today.getDay()];
  fcElements[1].textContent = weekday[tomorrow.getDay()];
  fcElements[2].textContent = weekday[dayAfter.getDay()];

  fcElements[3].appendChild(new Image()).src = forecastMap(
    forecast.todayMorn.weather || "minus"
  );
  fcElements[6].appendChild(new Image()).src = forecastMap(
    forecast.todayArvo.weather || "minus"
  );
  fcElements[9].appendChild(new Image()).src = forecastMap(
    forecast.todayEve.weather || "minus"
  );

  fcElements[4].appendChild(new Image()).src = forecastMap(
    forecast.tomorrowEve.weather || "minus"
  );

  fcElements[7].appendChild(new Image()).src = forecastMap(
    forecast.tomorrowEve.weather || "minus"
  );
  fcElements[10].appendChild(new Image()).src = forecastMap(
    forecast.tomorrowEve.weather || "minus"
  );

  fcElements[5].appendChild(new Image()).src = forecastMap(
    forecast.dayAfterEve.weather || "minus"
  );

  fcElements[8].appendChild(new Image()).src = forecastMap(
    forecast.dayAfterEve.weather || "minus"
  );
  fcElements[11].appendChild(new Image()).src = forecastMap(
    forecast.dayAfterEve.weather || "minus"
  );
}

//Async function to retrieve current weather data
async function getCurrentWeather(location) {
  const url =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    location +
    "&APPID=32546ef9eee647609c5b06622ae0d03f" +
    "&units=" +
    units;
  const response = await fetch(url, { mode: "cors" });
  return await response.json();
}

//api.openweathermap.org/data/2.5/forecast?q=Auckland&appid=32546ef9eee647609c5b06622ae0d03f&units=metric
async function getWeatherForecast(location) {
  const url =
    "http://api.openweathermap.org/data/2.5/forecast?q=" +
    location +
    "&APPID=32546ef9eee647609c5b06622ae0d03f" +
    "&units=" +
    units;
  const response = await fetch(url, { mode: "cors" });
  return await response.json();
}

//Function to handle errors
function handleErrors(err) {
  city.textContent = "";
  cTemp.textContent = "";
  input.value = "";
  console.log("Error: " + err);
}

function handleForecastResponse(result) {
  //Create baseline date variables
  today = new Date();
  today.setHours(0, 0, 0, 0);

  tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  //Create object to store forecast data
  forecast = {
    todayMorn: { time: 0, weather: null }, //Time between 00:00 and 09:59 (should pick up 7am)
    todayArvo: { time: 0, weather: null }, //Time between 12:00 and 14:00 (should pick up 1pm)
    todayEve: { time: 0, weather: null }, //Time between 17:00 and 20:00 (should pick up 7pm)

    tomorrowMorn: { time: 0, weather: null },
    tomorrowArvo: { time: 0, weather: null },
    tomorrowEve: { time: 0, weather: null },

    dayAfterMorn: { time: 0, weather: null },
    dayAfterArvo: { time: 0, weather: null },
    dayAfterEve: { time: 0, weather: null },
  };

  //Loop over resultset updating the forecast object with applicable data
  result.list.forEach((record) => {
    const recordDateTime = new Date(record.dt_txt + "Z");
    const justTheTime = recordDateTime.getHours();
    const justTheDate = new Date(recordDateTime);
    justTheDate.setHours(0, 0, 0, 0);

    if (justTheDate.getTime() === today.getTime()) {
      //If data is for today
      recordForecast("today", justTheTime, record.weather[0]);
    } else if (justTheDate.getTime() === tomorrow.getTime()) {
      //Record is for tomorrow
      recordForecast("tomorrow", justTheTime, record.weather[0]);
    } else if (justTheDate.getTime() === dayAfter.getTime()) {
      //Record is for day after
      recordForecast("dayAfter", justTheTime, record.weather[0]);
    }
  });
}

function recordForecast(day, justTheTime, data) {
  if (justTheTime > 0 && justTheTime < 10) {
    //If data is for the morning
    forecast[day + "Morn"].time = justTheTime;
    forecast[day + "Morn"].weather = data.main;
  } else if (justTheTime > 12 && justTheTime < 15) {
    //If data is for the afternoon
    forecast[day + "Arvo"].time = justTheTime;
    forecast[day + "Arvo"].weather = data.main;
  } else if (justTheTime > 17 && justTheTime < 20) {
    //If data is for the evening
    forecast[day + "Eve"].time = justTheTime;
    forecast[day + "Eve"].weather = data.main;
  }
}
