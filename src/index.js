import { utcToZonedTime } from "date-fns-tz";
import "./styles.css";

//Global element variables
const searchButton = document.querySelector("#search");
const input = document.querySelector("#input");
const city = document.querySelector("#location");
const cTemp = document.querySelector("#cTemp");
const cWeather = document.querySelector("#cWeather");
const units = "metric";
//

//Event listener
input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
});
//Event listener
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
};

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

//Take a dateTime and return DD-MM-YYYY
function getPlainDate(date) {
  //const utcDateTime = new Date(date);
  console.log("Date received: " + new Date(date));
  console.log("Formatted local with Z: " + new Date(date + "Z"));

  console.log(
    "Formatted with UTCtoZoned: " +
      utcToZonedTime(date + "Z", "Australia/Melbourne").toString()
  );
}

getWeatherForecast("Auckland").then(function (result) {
  //Date variables used in forecast calculation
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  //Object to store 3-day weather forecast
  let forecast = {
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

  result.list.forEach((record) => {
    const recordDateTime = new Date(record.dt_txt + "Z");
    const justTheTime = recordDateTime.getHours();
    const justTheDate = new Date(recordDateTime);
    justTheDate.setHours(0, 0, 0, 0);

    if (justTheDate.getTime() === today.getTime()) {
      //If data is for today
      updateData("today", justTheTime, record.weather[0]);
    } else if (justTheDate.getTime() === tomorrow.getTime()) {
      updateData("tomorrow", justTheTime, record.weather[0]);
    } else if (justTheDate.getTime() === dayAfter.getTime()) {
      updateData("dayAfter", justTheTime, record.weather[0]);
    }
  });

  function updateData(day, justTheTime, data) {
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
  console.log(forecast);
});
