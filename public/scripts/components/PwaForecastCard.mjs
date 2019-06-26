import EventBus from '/scripts/EventBus.mjs';

export const PwaForecastCard = {
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
          :key="forecast.date"
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
    EventBus.$on('renderForecast', ({
      data,
      key
    }) => {
      if (!(this.geokey in data.selectedLocations)) {
        this.isVisible = false;
      }
      if (key !== this.geokey) return;
      if (!(key in data.selectedLocations)) return;

      if (data.selectedLocations[key].forecast) {
        this.setLocation(data.selectedLocations[key]);
        this.isLoading = false;
      }
      this.isVisible = true;
    });
  },
  methods: {
    handleRemove() {
      EventBus.$emit('removeLocation', {
        key: this.geokey
      });
    },
    setLocation(location) {
      const {
        forecast: data
      } = location;
      if (!data) {
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
};
