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

let deferredInstallPrompt = null;

EventBus.$on('appinstalled', () => {
  console.log('Weather App was installed.', evt);
});

EventBus.$on('beforeinstallprompt', ({ data }) => {
  deferredInstallPrompt = data;
  EventBus.$emit('PwaButtonInstall:show')
});

EventBus.$on('installPWA', () => {
  // CODELAB: Add code show install prompt & hide the install button.
  deferredInstallPrompt.prompt();
  // Hide the install button, it can't be called twice.
  EventBus.$emit('PwaButtonInstall:hide');
  // Log user response to prompt.
  deferredInstallPrompt.userChoice
    .then((choice) => {
      if (choice.outcome === 'accepted') {
        EventBus.$emit('install:accept');
      } else {
        EventBus.$emit('install:dismiss');
      }
      deferredInstallPrompt = null;
    });
});

EventBus.$on('install:accept', () => {
  console.log('User accepted the A2HS prompt', choice);
});

EventBus.$on('install:dismiss', () => {
  console.log('User dismissed the A2HS prompt', choice);
});

const PwaButtonInstall = {
  template: `<button v-if="isShown" id="butInstall" aria-label="Install"></button>`,
  mounted() {
    EventBus.$on('PwaButtonInstall:hide', () => {
      this.hide();
    });
    EventBus.$on('PwaButtonInstall:show', () => {
      this.show();
    });
  },
  data() {
    return {
      isShown: false,
    };
  },
  methods: {
    hide() {
      this.isShown = false;
    },
    installPWA() {
      EventBus.$emit('installPWA');
    },
    show() {
      this.isShown = true;
    }
  },
};

window.addEventListener('beforeinstallprompt', function handleBeforeInstallPrompt(evt) {
  EventBus.$emit('beforeinstallprompt', { data: evt });
});

window.addEventListener('appinstalled', function handleAppInstalled(evt) {
  EventBus.$emit('appinstalled', { data: evt });
});

export default {
  PwaButtonInstall,
};
export {
  PwaButtonInstall,
};
