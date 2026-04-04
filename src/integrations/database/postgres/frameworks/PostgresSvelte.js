import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { schemaContent, sveltePrismaContent, sveltePostgresApiContent, sveltePackageJsonPostgres } from "../../../../../lib/backend/utils/utility.js";

export class PostgresSvelte {
  constructor({ projectName, answers }) {
    this.projectName = projectName;
    this.answers = answers;
  }

  async setup() {
    console.log(chalk.blue("\nSetting up for SvelteKit project..."));
    try {
      process.chdir(this.projectName);
      const rootDir = path.resolve(process.cwd());
      const libPath = path.join(rootDir, "src", "lib");
      const prismaLibPath = path.join(libPath, "prisma");
      const prismaPath = path.join(rootDir, "prisma");
      const routesPath = path.join(rootDir, "src", "routes", "api", "users");

      // Create directories
      [libPath, prismaLibPath, prismaPath, routesPath].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // Create database connection file
      fs.writeFileSync(
        path.join(prismaLibPath, "index.js"),
        sveltePrismaContent.trim()
      );

      // Create API route for users
      fs.writeFileSync(
        path.join(routesPath, "+server.js"),
        sveltePostgresApiContent.trim()
      );

      // Create .env file
      const { username, password, host, port, database } = this.answers;
      const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;

      fs.writeFileSync(
        path.join(rootDir, ".env"),
        `DATABASE_URL="${dbUrl}"\nNODE_ENV=development`
      );

      fs.writeFileSync(
        path.join(rootDir, ".env.example"),
        `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"\nNODE_ENV=development`
      );

      // Create prisma/schema.prisma
      fs.writeFileSync(path.join(prismaPath, "schema.prisma"), schemaContent.trim());

      // Update package.json with Prisma dependencies
      const packageJsonPath = path.join(rootDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const existingPackage = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        existingPackage.dependencies = {
          ...existingPackage.dependencies,
          ...sveltePackageJsonPostgres.dependencies
        };
        existingPackage.devDependencies = {
          ...existingPackage.devDependencies,
          ...sveltePackageJsonPostgres.devDependencies
        };
        existingPackage.scripts = {
          ...existingPackage.scripts,
          ...sveltePackageJsonPostgres.scripts
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(existingPackage, null, 2));
      } else {
        fs.writeFileSync(packageJsonPath, JSON.stringify(sveltePackageJsonPostgres, null, 2));
      }

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      console.log(chalk.blue("Generating Prisma client..."));
      await execa("npx", ["prisma", "generate"], { cwd: rootDir, stdio: "inherit" });

      console.log(chalk.blue("Running database migration..."));
      await execa("npx", ["prisma", "migrate", "dev"], { cwd: rootDir, stdio: "inherit" });

      console.log(chalk.white("\n📋 Setup Summary:"));
      console.log(chalk.cyan("   Database setup: ") + prismaLibPath);
      console.log(chalk.cyan("   Schema: ") + prismaPath);
      console.log(chalk.cyan("   API routes: ") + routesPath);
      console.log(chalk.cyan("   Environment: ") + ".env file created");

      console.log(chalk.green("\n🚀 SvelteKit PostgreSQL with Prisma setup completed!"));
      console.log(chalk.yellow("\nNext steps:"));
      console.log(chalk.yellow("1. Run 'npm run dev' to start the development server"));
      console.log(chalk.yellow("2. Test the API at /api/users (GET and POST)"));
      console.log(chalk.yellow("3. Use 'npm run db:studio' to open Prisma Studio"));
      console.log(chalk.yellow("4. Remember to hash passwords in production!"));

    } catch (error) {
      console.error(chalk.red("Error setting up SvelteKit PostgreSQL backend:"), error.message);
      console.log(chalk.yellow("You may need to finish setup manually."));
    }
  }
}
