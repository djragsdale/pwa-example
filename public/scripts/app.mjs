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
import {
  PwaAddButton,
  PwaAddDialog,
  PwaButtonRefresh,
  PwaForecastCard,
  PwaForecastFutureTile,
  PwaForecastList,
} from '/scripts/components/index.mjs';
import { PwaButtonInstall } from '/scripts/install.mjs';
import Vue from '/scripts/vue/vue.esm.browser.js';

const weatherApp = {
  selectedLocations: {},
};

const events = [
  'addLocation',
  'getData',
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
  const {
    geo,
    label
  } = data;
  // Hide the dialog
  EventBus.$emit('toggleAddDialog');
  // Get the selected city
  const location = {
    label,
    geo
  };
  // Save the updated list of selected cities.
  weatherApp.selectedLocations[geo] = location;
  saveLocationList(weatherApp.selectedLocations);
  getForecastFromNetwork(geo).then((forecast) => {
    console.log('Adding new location from network.', label);
    weatherApp.selectedLocations[geo].forecast = forecast;
    saveLocationList(weatherApp.selectedLocations);
    EventBus.$emit('renderForecast', {
      data: weatherApp,
      key: geo,
    });
  });
  EventBus.$emit('refreshLocations', { data: weatherApp.selectedLocations });
});

EventBus.$on('removeLocation', ({ key }) => {
  if (weatherApp.selectedLocations[key]) {
    delete weatherApp.selectedLocations[key];
    saveLocationList(weatherApp.selectedLocations);
  }
  EventBus.$emit('refreshLocations', { data: weatherApp.selectedLocations });
});

EventBus.$on('updateData', () => {
  Object.keys(weatherApp.selectedLocations).forEach((key) => {
    const location = weatherApp.selectedLocations[key];
    // const card = getForecastCard(location);
    // CODELAB: Add code to call getForecastFromCache
    getForecastFromCache(location.geo)
      .then((forecast) => {
        console.log('get from cache', key);
        location.forecast = forecast;
        // renderForecast(key, forecast);
        EventBus.$emit('renderForecast', {
          data: weatherApp,
          key,
        });
      });

    // Get the forecast data from the network.
    getForecastFromNetwork(location.geo)
      .then((forecast) => {
        console.log('get from network', key);
        // renderForecast(key, forecast);
        location.forecast = forecast;
        EventBus.$emit('renderForecast', {
          data: weatherApp,
          key,
        });
      });
  });
});

Vue.component('pwa-add-button', PwaAddButton);
Vue.component('pwa-add-dialog', PwaAddDialog);
Vue.component('pwa-button-install', PwaButtonInstall);
Vue.component('pwa-button-refresh', PwaButtonRefresh);
Vue.component('pwa-forecast-card', PwaForecastCard);
Vue.component('pwa-forecast-future-tile', PwaForecastFutureTile);
Vue.component('pwa-forecast-list', PwaForecastList);

new Vue({
  el: '#app'
});

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
  EventBus.$emit('updateData');
}

init();
