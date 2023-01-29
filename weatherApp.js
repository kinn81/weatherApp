const searchButton = document.querySelector("#search");
const input = document.querySelector("#input");

searchButton.onclick = () => {
  if (input.value.length > 0) {
    getWeather(input.value).catch(handleErrors);
  }
};

async function getWeather(location) {
  const url =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    location +
    "&APPID=32546ef9eee647609c5b06622ae0d03f";

  const response = await fetch(url, { mode: "cors" });
  const data = await response.json();

  document.querySelector("#location").textContent = location;
  document.querySelector("#temp").textContent = data.main.temp;
}

function handleErrors(err) {
  document.querySelector("#location").textContent = "";
  document.querySelector("#temp").textContent = "";
  input.value = "";
  console.log("Error: " + err);
}

//let weatherData = getWeather("Auckland", "");
//console.log(weatherData);

//weatherData.then();

//getWeather("auckland", "32546ef9eee647609c5b06622ae0d03f");
