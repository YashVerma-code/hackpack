import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { svelteMongoDbContent, svelteUserModelContent, svelteApiRouteContent, sveltePackageJsonMongo } from "../../../../../lib/backend/utils/utility.js";

export class MongoSvelte {
  constructor({ projectName, language, mongoUri }) {
    this.projectName = projectName;
    this.language = language;
    this.mongoUri = mongoUri;
  }

  async setup() {
    console.log(chalk.blue("\nSetting up for SvelteKit project..."));
    try {
      const rootDir = path.resolve(process.cwd());
      const libPath = path.join(rootDir, "src", "lib");
      const databasePath = path.join(libPath, "database");
      const modelsPath = path.join(databasePath, "models");
      const routesPath = path.join(rootDir, "src", "routes", "api", "users");

      // Create directories
      [libPath, databasePath, modelsPath, routesPath].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // Create database connection file
      fs.writeFileSync(
        path.join(databasePath, `mongoose.${this.language === 'ts' ? 'ts' : 'js'}`),
        svelteMongoDbContent.trim()
      );

      // Create User model
      fs.writeFileSync(
        path.join(modelsPath, `User.model.${this.language === 'ts' ? 'ts' : 'js'}`),
        svelteUserModelContent.trim()
      );

      // Create API route for users
      fs.writeFileSync(
        path.join(routesPath, `+server.${this.language === 'ts' ? 'ts' : 'js'}`),
        svelteApiRouteContent.trim()
      );

      // Update package.json with MongoDB dependencies
      const packageJsonPath = path.join(rootDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const existingPackage = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        existingPackage.dependencies = {
          ...existingPackage.dependencies,
          ...sveltePackageJsonMongo.dependencies
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(existingPackage, null, 2));
      } else {
        fs.writeFileSync(packageJsonPath, JSON.stringify(sveltePackageJsonMongo, null, 2));
      }

      // Create .env file
      fs.writeFileSync(
        path.join(rootDir, ".env"),
        `MONGO_URI=${this.mongoUri}\nNODE_ENV=development\nCLIENT_URL=your_client_url_here`
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(rootDir, ".env.example"),
        "MONGO_URI=mongodb://localhost:27017/your-database\nNODE_ENV=development"
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

    } catch (error) {
      console.error(chalk.red("Error setting up SvelteKit MongoDB backend:"), error.message);
      console.log(chalk.yellow("You may need to finish setup manually."));
    }
  }
}
