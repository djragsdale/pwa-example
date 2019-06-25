/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

import EventBus from '/scripts/EventBus.mjs';
import { PwaButtonInstall } from '/scripts/install.mjs';
import Vue from '/scripts/vue/vue.esm.browser.js';

const weatherApp = {
  selectedLocations: {},
  // addDialogContainer: document.getElementById('addDialogContainer'),
};

const events = [
  'addLocation',
  'getForecastCard',
  'getForecastFromCache',
  'getForecastFromNetwork',
  'init',
  'loadLocationList',
  'refreshLocations',
  'removeLocation',
  'renderForecast',
  'saveLocationList',
  'toggleAddDialog',
  'updateData',
];

events.forEach((eventName) => {
  EventBus.$on(eventName, (data) => {
    console.log(`EVENT LOGGER: ${eventName}`, data);
  });
});

EventBus.$on('addLocation', ({ data }) => {
  addLocation(data);
  EventBus.$emit('refreshLocations');
});

EventBus.$on('removeLocation', ({ key }) => {
  removeLocation(key);
  EventBus.$emit('refreshLocations');
});

Vue.component('pwa-add-button', {
  template: `
    <button id="butAdd" class="fab" aria-label="Add" @click="handleClick">
      <span class="icon add"></span>
    </button>
  `,
  methods: {
    handleClick() {
      EventBus.$emit('toggleAddDialog');
    }
  },
});

Vue.component('pwa-add-dialog', {
  template: `
    <div id="addDialogContainer" :class="{ visible: isVisible }">
      <div class="dialog">
        <div class="dialog-title">Add new city</div>
        <div class="dialog-body">
          <select id="selectCityToAdd" aria-label="City to add" v-model="selected">
            <!--
              Values are lat/lon values, use Google Maps to find and add
              additional cities.
            -->
            <option v-for="option in options" v-bind:value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>
        <div class="dialog-buttons">
          <button id="butDialogCancel" class="button" @click="toggleVisibility">Cancel</button>
          <button id="butDialogAdd" class="button" @click="handleAddLocation">Add</button>
        </div>
      </div>
    </div>
  `,
  data() {
    const options = [
      {
        text: 'Dehli, India',
        value: '28.6472799,76.8130727',
      },
      {
        text: 'Jakarta, Indonesia',
        value: '-5.7759362,106.1174957',
      },
      {
        text: 'London, UK',
        value: '51.5287718,-0.2416815',
      },
      {
        text: 'New York, USA',
        value: '40.6976701,-74.2598666',
      },
      {
        text: 'Paris, France',
        value: '48.8589507,2.2770202',
      },
      {
        text: 'Port Lockroy, Antarctica',
        value: '-64.8251018,-63.496847',
      },
      {
        text: 'San Francisco, USA',
        value: '37.757815,-122.5076401',
      },
      {
        text: 'Shanghai, China',
        value: '31.2243085,120.9162955',
      },
      {
        text: 'Tokyo, Japan',
        value: '35.6735408,139.5703032',
      },
    ];

    return {
      isVisible: false,
      options: options,
      selected: options[0].value,
    };
  },
  mounted() {
    EventBus.$on('toggleAddDialog', () => {
      this.toggleVisibility();
    });
  },
  methods: {
    handleAddLocation() {
      const selectedOption = this.getOptionByValue(this.selected);
      EventBus.$emit('addLocation', {
        data: {
          geo: selectedOption.value,
          label: selectedOption.text,
        },
      });
    },
    getOptionByValue(value) {
      return this.options.find(option => option.value === value);
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible;
    },
  },
});

Vue.component('pwa-button-install', PwaButtonInstall);

Vue.component('pwa-forecast-card', {
  template: `
    <div v-if="isVisible" :id="location.geo" class="weather-card">
      <div v-if="isLoading" class="card-spinner">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <circle cx="16" cy="16" r="14" fill="none"></circle>
        </svg>
      </div>
      <button class="remove-city" @click="handleRemove">&times;</button>
      <div class="city-key" hidden>{{ geokey }}</div>
      <div class="card-last-updated" hidden>{{ lastUpdated }}</div>
      <div class="location">{{ locationLabel }}</div>
      <div class="date">{{ date }}</div>
      <div class="description">{{ description }}</div>
      <div class="current">
        <div class="visual">
          <div :class="currentIconName" class="icon"></div>
          <div class="temperature">
            <span class="value">{{ currentTemperature }}</span><span class="scale">°F</span>
          </div>
        </div>
        <div class="description">
          <div class="humidity">
            <span class="label">Humidity:</span>
            <span class="value">{{ currentHumidity }}</span><span class="scale">%</span>
          </div>
          <div class="wind">
            <span class="label">Wind:</span>
            <span class="value">{{ currentWindSpeed }}</span>
            <span class="scale">mph</span>
            <span class="direction">{{ currentWindDirection }}</span>°
          </div>
          <div class="sunrise">
            <span class="label">Sunrise:</span>
            <span class="value">{{ sunrise }}</span>
          </div>
          <div class="sunset">
              <span class="label">Sunset:</span>
              <span class="value">{{ sunset }}</span>
            </div>
        </div>
      </div>
      <div v-if="location" class="future">
        <pwa-forecast-future-tile
          v-for="forecast in futureTiles"
          :date="forecast.date"
          :iconClass="forecast.iconClass"
          :temperatureHigh="forecast.temperatureHigh"
          :temperatureLow="forecast.temperatureLow"
        ></pwa-forecast-future-tile>
      </div>
    </div>
  `,
  props: {
    geokey: String,
  },
  data() {
    return {
      currentHumidity: null,
      currentIconName: null,
      currentTemperature: null,
      currentWindDirection: null,
      currentWindSpeed: null,
      date: null,
      description: null,
      futureTiles: [],
      isLoading: true,
      isVisible: true,
      lastUpdated: 0,
      location: {},
      locationLabel: '',
      sunrise: null,
      sunset: null,
      time: null,
    };
  },
  mounted() {
    console.log('pwa-forecast-card mounted', this.geokey);
    EventBus.$on('renderForecast', ({ key }) => {
      if (!(this.geokey in weatherApp.selectedLocations)) {
        this.isVisible = false;
      }
      if (key !== this.geokey) return;
      if (!(key in weatherApp.selectedLocations)) return;

      console.log('before setLocation', weatherApp.selectedLocations[key].forecast);
      if (weatherApp.selectedLocations[key].forecast) {
        this.setLocation(weatherApp.selectedLocations[key]);
        this.isLoading = false;
      }
      this.isVisible = true;
    });
  },
  methods: {
    handleRemove() {
      EventBus.$emit('removeLocation', { key: this.geokey });
    },
    setLocation(location) {
      const { forecast: data } = location;
      console.log('setLocation method', JSON.parse(JSON.stringify(data)));
      if (!data) {
        console.log('data not found');
        return;
      }
      // Find out when the element was last updated.
      // If the data on the element is newer, skip the update.
      if (this.lastUpdated >= data.currently.time) {
        return;
      }

      this.location = data;
      this.locationLabel = location.label; // TODO: Why is this not here anymore????

      this.lastUpdated = parseInt(data.currently.time);

      // Render the forecast data into the card.
      this.description = data.currently.summary;
      const forecastFrom = luxon.DateTime
        .fromSeconds(data.currently.time)
        .setZone(data.timezone)
        .toFormat('DDDD t');
      this.date = forecastFrom;
      this.currentIconName = data.currently.icon;
      this.currentTemperature = Math.round(data.currently.temperature);
      this.currentHumidity = Math.round(data.currently.humidity * 100);
      this.currentWindSpeed = Math.round(data.currently.windSpeed);
      this.currentWindDirection = Math.round(data.currently.windBearing);
      const sunrise = luxon.DateTime
        .fromSeconds(data.daily.data[0].sunriseTime)
        .setZone(data.timezone)
        .toFormat('t');
      this.sunrise = sunrise;
      const sunset = luxon.DateTime
        .fromSeconds(data.daily.data[0].sunsetTime)
        .setZone(data.timezone)
        .toFormat('t');
      this.sunset = sunset;

      // Render the next 7 days.
      this.futureTiles = data.daily.data.slice(1)
        .map((forecast) => {
          const forecastFor = luxon.DateTime
            .fromSeconds(forecast.time)
            .setZone(data.timezone)
            .toFormat('ccc');

          return {
            date: forecastFor,
            iconClass: forecast.icon,
            temperatureHigh: Math.round(forecast.temperatureHigh),
            temperatureLow: Math.round(forecast.temperatureLow),
          };
        });
    },
  },
});

Vue.component('pwa-forecast-future-tile', {
  template: `
    <div class="oneday">
      <div class="date">{{ date }}</div>
      <div :class="iconClass" class="icon"></div>
      <div class="temp-high">
        <span class="value">{{ temperatureHigh }}</span>°
      </div>
      <div class="temp-low">
        <span class="value">{{ temperatureLow }}</span>°
      </div>
    </div>
  `,
  props: {
    date: String,
    iconClass: String,
    temperatureHigh: Number,
    temperatureLow: Number,
  },
});

Vue.component('pwa-forecast-list', {
  template: `
    <div>
      <pwa-forecast-card v-for="geoKey in locationKeys" :geokey="geoKey" :key="geoKey"></pwa-forecast-card>
    </div>
  `,
  data() {
    return {
      locations: {},
      locationKeys: [],
    }
  },
  // computed: {
    // locationKeys() {
    //   return Object.keys(this.locations);
    // },
  // },
  mounted() {
    EventBus.$on('init', () => {
      this.refreshLocations();
    });
    // EventBus.$on('addLocation', () => {
    //   this.refreshLocations();
    // });
    // EventBus.$on('removeLocation', () => {
    //   this.refreshLocations();
    // });
    EventBus.$on('refreshLocations', () => {
      this.refreshLocations();
    });
    EventBus.$on('renderForecast', () => {
      this.refreshLocations();
    });
  },
  methods: {
    refreshLocations() {
      this.locations = weatherApp.selectedLocations;
      console.log('pwa-forecast-list refreshLocations', this.locations);
      this.locationKeys = Object.keys(this.locations);
    },
  },
});

new Vue({
  el: '#app'
});

// /**
//  * Toggles the visibility of the add location dialog box.
//  */
// function toggleAddDialog() {
//   weatherApp.addDialogContainer.classList.toggle('visible');
// }

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation(data) {
  console.log('addLocation fn', data);
  const { geo, label } = data;
  // Hide the dialog
  // toggleAddDialog();
  EventBus.$emit('toggleAddDialog');
  // Get the selected city
  // const select = document.getElementById('selectCityToAdd');
  // const selected = select.options[select.selectedIndex];
  // const geo = selected.value;
  // const label = selected.textContent;
  const location = { label, geo };
  // Create a new card & get the weather data from the server
  // const card = getForecastCard(location);
  // Save the updated list of selected cities.
  weatherApp.selectedLocations[geo] = location;
  saveLocationList(weatherApp.selectedLocations);
  getForecastFromNetwork(geo).then((forecast) => {
    console.log('Adding new location from network.', label);
    // renderForecast(card, forecast);
    weatherApp.selectedLocations[geo].forecast = forecast;
    saveLocationList(weatherApp.selectedLocations);
    EventBus.$emit('renderForecast', { key: geo });
  });
}

/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(geoKey) {
  // const parent = evt.srcElement.parentElement;
  // parent.setAttribute('hidden', true);
  if (weatherApp.selectedLocations[geoKey]) {
    delete weatherApp.selectedLocations[geoKey];
    saveLocationList(weatherApp.selectedLocations);
  }
}

// /**
//  * Renders the forecast data into the card element.
//  *
//  * @param {Element} card The card element to update.
//  * @param {Object} data Weather forecast data to update the element with.
//  */
// function renderForecast(card, data) {
//   if (!data) {
//     // There's no data, skip the update.
//     return;
//   }

//   // Find out when the element was last updated.
//   const cardLastUpdatedElem = card.querySelector('.card-last-updated');
//   const cardLastUpdated = cardLastUpdatedElem.textContent;
//   const lastUpdated = parseInt(cardLastUpdated);

//   // If the data on the element is newer, skip the update.
//   if (lastUpdated >= data.currently.time) {
//     return;
//   }
//   cardLastUpdatedElem.textContent = data.currently.time;

//   // Render the forecast data into the card.
//   card.querySelector('.description').textContent = data.currently.summary;
//   const forecastFrom = luxon.DateTime
//       .fromSeconds(data.currently.time)
//       .setZone(data.timezone)
//       .toFormat('DDDD t');
//   card.querySelector('.date').textContent = forecastFrom;
//   card.querySelector('.current .icon')
//       .className = `icon ${data.currently.icon}`;
//   card.querySelector('.current .temperature .value')
//       .textContent = Math.round(data.currently.temperature);
//   card.querySelector('.current .humidity .value')
//       .textContent = Math.round(data.currently.humidity * 100);
//   card.querySelector('.current .wind .value')
//       .textContent = Math.round(data.currently.windSpeed);
//   card.querySelector('.current .wind .direction')
//       .textContent = Math.round(data.currently.windBearing);
//   const sunrise = luxon.DateTime
//       .fromSeconds(data.daily.data[0].sunriseTime)
//       .setZone(data.timezone)
//       .toFormat('t');
//   card.querySelector('.current .sunrise .value').textContent = sunrise;
//   const sunset = luxon.DateTime
//       .fromSeconds(data.daily.data[0].sunsetTime)
//       .setZone(data.timezone)
//       .toFormat('t');
//   card.querySelector('.current .sunset .value').textContent = sunset;

//   // Render the next 7 days.
//   const futureTiles = card.querySelectorAll('.future .oneday');
//   futureTiles.forEach((tile, index) => {
//     const forecast = data.daily.data[index + 1];
//     const forecastFor = luxon.DateTime
//         .fromSeconds(forecast.time)
//         .setZone(data.timezone)
//         .toFormat('ccc');
//     tile.querySelector('.date').textContent = forecastFor;
//     tile.querySelector('.icon').className = `icon ${forecast.icon}`;
//     tile.querySelector('.temp-high .value')
//         .textContent = Math.round(forecast.temperatureHigh);
//     tile.querySelector('.temp-low .value')
//         .textContent = Math.round(forecast.temperatureLow);
//   });

//   // If the loading spinner is still visible, remove it.
//   const spinner = card.querySelector('.card-spinner');
//   if (spinner) {
//     card.removeChild(spinner);
//   }
// }

/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromNetwork(coords) {
  return fetch(`/forecast/${coords}`)
      .then((response) => {
        return response.json();
      })
      .catch(() => {
        return null;
      });
}

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(coords) {
  // CODELAB: Add code to get weather forecast from the caches object.
  if (!('caches' in window)) {
    return null;
  }
  const url = `${window.location.origin}/forecast/${coords}`;
  return caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch((err) => {
      console.error('Error getting data from cache', err);
      return null;
    });
}

// /**
//  * Get's the HTML element for the weather forecast, or clones the template
//  * and adds it to the DOM if we're adding a new item.
//  *
//  * @param {Object} location Location object
//  * @return {Element} The element for the weather forecast.
//  */
// function getForecastCard(location) {
//   const id = location.geo;
//   const card = document.getElementById(id);
//   if (card) {
//     return card;
//   }
//   const newCard = document.getElementById('weather-template').cloneNode(true);
//   newCard.querySelector('.location').textContent = location.label;
//   newCard.setAttribute('id', id);
//   newCard.querySelector('.remove-city')
//       .addEventListener('click', removeLocation);
//   document.querySelector('main').appendChild(newCard);
//   newCard.removeAttribute('hidden');
//   return newCard;
// }

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() {
  Object.keys(weatherApp.selectedLocations).forEach((key) => {
    const location = weatherApp.selectedLocations[key];
    // const card = getForecastCard(location);
    // CODELAB: Add code to call getForecastFromCache
    getForecastFromCache(location.geo)
      .then((forecast) => {
        console.log('get from cache', key);
        location.forecast = forecast;
        // renderForecast(key, forecast);
        EventBus.$emit('renderForecast', { key });
      });

    // Get the forecast data from the network.
    getForecastFromNetwork(location.geo)
        .then((forecast) => {
          console.log('get from network', key);
          // renderForecast(key, forecast);
          location.forecast = forecast;
          EventBus.$emit('renderForecast', { key });
        });
  });
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem('locationList', data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadLocationList() {
  let locations = localStorage.getItem('locationList');
  if (locations) {
    try {
      locations = JSON.parse(locations);
    } catch (ex) {
      locations = {};
    }
  }
  if (!locations || Object.keys(locations).length === 0) {
    const key = '40.7720232,-73.9732319';
    locations = {};
    locations[key] = {label: 'New York City', geo: '40.7720232,-73.9732319'};
  }
  return locations;
}

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
  // Get the location list, and update the UI.
  weatherApp.selectedLocations = loadLocationList();
  updateData();

  // Set up the event handlers for all of the buttons.
  document.getElementById('butRefresh').addEventListener('click', updateData);
  // document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
  // document.getElementById('butDialogCancel')
  //     .addEventListener('click', toggleAddDialog);
  // document.getElementById('butDialogAdd')
  //     .addEventListener('click', addLocation);
  EventBus.$emit('init');
}

init();
