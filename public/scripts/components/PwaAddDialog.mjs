import EventBus from '/scripts/EventBus.mjs';

export const PwaAddDialog = {
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
    const options = [{
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
};
