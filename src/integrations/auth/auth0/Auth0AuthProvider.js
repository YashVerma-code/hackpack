import chalk from "chalk";
import { BaseAuthProvider } from "../BaseAuthProvider.js";
import { setupAuth0Angular } from "../../../../lib/authentication/utils/auth0angular.js";

export class Auth0AuthProvider extends BaseAuthProvider {
  static id = 'authzero';
  static displayName = 'Auth0';
  static supportedFrameworks = ['angular'];

  async setup(state) {
    const { framework, projectName, language } = state;

    console.log(chalk.blue(`Setting up Auth0 for ${framework} project: ${projectName} \nLanguage: ${language}`));

    if (framework === 'angular') {
      await setupAuth0Angular(state);
      console.log(chalk.blue("For localhost testing, you may need an HTTPS proxy."));
      console.log(chalk.blue("Run the following command for temporary public URL:"));
      console.log(chalk.cyan("hp expose"));
      return;
    } else {
      console.log(chalk.yellow(`Auth0 setup for framework '${framework}' is not yet automated. Please refer to https://auth0.com/docs/quickstart/spa/angular for manual setup instructions.`));
    }
  }
}
