import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { postgresJsonContent, PostgresindexContent, schemaContent } from "../../../../../lib/backend/utils/utility.js";

export class PostgresDefault {
  constructor({ answers }) {
    this.answers = answers;
  }

  async setup() {
    const rootDir = path.resolve(process.cwd());
    const backendPath = path.join(rootDir, "backend");
    const srcPath = path.join(backendPath, "src");
    const prismaPath = path.join(backendPath, "prisma");

    [backendPath, srcPath, prismaPath].forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
    });

    // Create package.json with Prisma dependencies
    const prismaJsonContent = postgresJsonContent;

    fs.writeFileSync(
      path.join(backendPath, "package.json"),
      JSON.stringify(prismaJsonContent, null, 2)
    );

    // Create index.js
    const indexContent = PostgresindexContent;
    fs.writeFileSync(path.join(backendPath, "index.js"), indexContent.trim());

    // Create .env file
    const { username, password, host, port, database } = this.answers;
    const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;

    fs.writeFileSync(
      path.join(backendPath, ".env"),
      `DATABASE_URL="${dbUrl}"
        PORT=5000
        NODE_ENV=development`
    );

    fs.writeFileSync(
      path.join(backendPath, ".env.example"),
      `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
        PORT=5000
        NODE_ENV=development`
    );

    // Create prisma/schema.prisma
    const prismaSchemaContent = schemaContent;
    fs.writeFileSync(path.join(prismaPath, "schema.prisma"), prismaSchemaContent.trim());

    // Install dependencies
    console.log(chalk.blue("Installing dependencies..."));
    await execa("npm", ["install"], { cwd: backendPath, stdio: "inherit" });

    console.log(chalk.blue("Generating Prisma client..."));
    await execa("npx", ["prisma", "generate"], { cwd: backendPath, stdio: "inherit" });
    await execa("npm", ["prisma", "migrate", "dev",], { cwd: backendPath, stdio: "inherit" });


    console.log(chalk.green("\n🚀 PostgreSQL backend with Prisma setup completed."));
  }
}
