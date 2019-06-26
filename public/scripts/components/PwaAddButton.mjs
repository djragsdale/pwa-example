import EventBus from '/scripts/EventBus.mjs';

export const PwaAddButton = {
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
};
