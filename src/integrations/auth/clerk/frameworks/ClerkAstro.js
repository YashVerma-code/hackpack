import { setupClerkAstro } from "../../../../../lib/authentication/utils/clerkastro.js";

export class ClerkAstro {
  constructor(state) {
    this.state = state;
  }

  async setup() {
    await setupClerkAstro(this.state);
  }
}
