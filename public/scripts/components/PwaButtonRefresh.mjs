import EventBus from '/scripts/EventBus.mjs';

export const PwaButtonRefresh = {
  template: `<button id="butRefresh" aria-label="Refresh" @click="handleClick"></button>`,
  methods: {
    handleClick() {
      EventBus.$emit('updateData');
    },
  },
};
