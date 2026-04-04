import { setupSvelteClerk } from "../../../../../lib/authentication/utils/clerksvelte.js";

export class ClerkSvelte {
  constructor(state) {
    this.state = state;
  }

  async setup() {
    await setupSvelteClerk(this.state);
  }
}
