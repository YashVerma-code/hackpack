import { setupClerkNuxt } from "../../../../../lib/authentication/utils/clerknuxt.js";

export class ClerkNuxt {
  constructor(state) {
    this.state = state;
  }

  async setup() {
    await setupClerkNuxt(this.state);
  }
}
