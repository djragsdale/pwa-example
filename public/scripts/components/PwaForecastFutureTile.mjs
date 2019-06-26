export const PwaForecastFutureTile = {
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
};
