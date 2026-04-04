import { setupNextClerk } from "../../../../../lib/authentication/utils/clerknext.js";

export class ClerkNext {
  constructor(state) {
    this.state = state;
  }

  async setup() {
    await setupNextClerk(this.state);
  }
}
