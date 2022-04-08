const fs = require('fs');

const axios = require('axios');
const _ = require('lodash/string');

class Searches {

  history = [];
  dbPath = './db/database.json'

  constructor() {
    this.readDB();
  }

  get paramsMapBox() {
    return {
      'access_token': process.env.MAPBOX_KEY,
      'language': 'es',
      'limit': 5,
      // 'types':'place%2Cpostcode' -> it does not work
    }
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    }
  }

  get historyCapitalize() {
    const array = this.history.map(place => {
      place = _.startCase(_.toLower(place));
      return place;
    })
    return array;
  }


  async city(place = '') {
    try {
      // Http request

      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place.toLowerCase()}.json`,
        params: this.paramsMapBox,
      });
      const resp = await instance.get();
      return resp.data.features.map(place => ({
        id: place.id,
        site: place.place_name_es,
        length: place.center[0],
        latitud: place.center[1],
      }));
    } catch (err) {
      return []; // Returns the places that match "place" in an array

    }
  }

  async weatherSite(lat, lon) {
    try {
      // https://api.openweathermap.org/data/2.5/weather?appid=594f861229b9670776aedbb58b1a56e7&lat=-38.95735&lon=-68.04553&units=metric&lang=es
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: {
          ... this.paramsWeather,
          lat,
          lon,
        }
      });
      const { data } = await instance.get();

      return {
        desc: data.weather[0].description,
        min: data.main.temp_min,
        max: data.main.temp_max,
        temp: data.main.temp,
      };
    } catch (err) {
      console.log(err);
    }
  }

  addHistory(place = "") {
    if (this.history.includes(place.toLowerCase())) {
      return;
    }
    this.history.unshift(place.toLowerCase());
    this.writeDB();
  }

  writeDB() {
    const payload = {
      history: this.history,
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  readDB() {
    if (!fs.existsSync(this.dbPath)) return null;

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
    const data = JSON.parse(info);
    console.log(data);
    this.history = data.history;
  }
}

module.exports = Searches;