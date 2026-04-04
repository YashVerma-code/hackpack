import { setupVueClerk } from "../../../../../lib/authentication/utils/clerkvue.js";

export class ClerkVue {
  constructor(state) {
    this.state = state;
  }

  async setup() {
    await setupVueClerk(this.state);
  }
}
