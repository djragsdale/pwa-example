import EventBus from '/scripts/EventBus.mjs';

export const PwaForecastList = {
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
  mounted() {
    EventBus.$on('refreshLocations', ({ data }) => {
      this.refreshLocations(data);
    });
    EventBus.$on('renderForecast', ({ data }) => {
      this.refreshLocations(data.selectedLocations);
    });
  },
  methods: {
    refreshLocations(selectedLocations) {
      this.locations = selectedLocations;
      this.locationKeys = Object.keys(this.locations);
    },
  },
};
