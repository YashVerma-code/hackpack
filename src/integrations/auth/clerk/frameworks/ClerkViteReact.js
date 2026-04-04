import { setupViteReactClerk } from "../../../../../lib/authentication/utils/clerkreact.js";

export class ClerkViteReact {
  constructor(state) {
    this.state = state;
  }

  async setup() {
    const { framework, projectName, language, styling, uiLibrary } = this.state;
    const useTailwind = (styling === "tailwind");
    await setupViteReactClerk(framework, projectName, language, styling, useTailwind, uiLibrary);
  }
}
