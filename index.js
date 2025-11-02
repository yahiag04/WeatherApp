import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;


const API_KEY = process.env.API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  console.log("✅ POST / called");
  console.log("req.body =", req.body);

  try {
    // Get city name from form input name="city"
    const city = req.body.city?.trim();
    console.log("🏙 City received from form:", city);

    if (!city) {
      return res.render("index", {
        error: "Please enter a city name (e.g. Milan).",
      });
    }

    // Weatherbit API request (note: NO &include=minutely)
    const url = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(
      city
    )}&key=${API_KEY}`;

    console.log("🌍 Calling Weatherbit URL:", url);

    const response = await axios.get(url);
    console.log("🌦 Weatherbit status:", response.status);
    console.log("🌦 Weatherbit data:", response.data);

    const apiResponse = response.data;
    const weatherInfo =
      apiResponse &&
      apiResponse.data &&
      apiResponse.data.length > 0
        ? apiResponse.data[0]
        : null;

    console.log("🌡 Extracted weatherInfo:", weatherInfo);

    if (!weatherInfo) {
      return res.render("index", {
        error: `No data found for city ${city}. Try another one.`,
      });
    }

    // Success: render EJS with weather data
    res.render("index", {
      data: weatherInfo,
      city: city,
    });

  } catch (err) {
    console.log("🔥 ERROR talking to Weatherbit");
    console.log("err.message:", err.message);

    if (err.response) {
      console.log("err.response.status:", err.response.status);
      console.log("err.response.data:", err.response.data);
    }

    res.render("index", {
      error: "meteo non disponibile o non trovato (request failed)",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});