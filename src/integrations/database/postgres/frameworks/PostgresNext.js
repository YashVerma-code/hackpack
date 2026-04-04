import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { schemaContent, prismaClientContent, postgreSqlRoute } from "../../../../../lib/backend/utils/utility.js";

export class PostgresNext {
  constructor({ projectName, answers }) {
    this.projectName = projectName;
    this.answers = answers;
  }

  async setup() {
    process.chdir(this.projectName);
    const rootDir = path.resolve(process.cwd());
    const libPath = path.join(rootDir, "lib");
    const prismasetupPath = path.join(libPath, "prisma");
    const prismaSchemaPath = path.join(rootDir, "prisma");
    [
      rootDir,
      libPath,
      prismasetupPath,
      prismaSchemaPath,
    ].forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
    });

    // Create .env file
    const { username, password, host, port, database } = this.answers;
    const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;

    fs.writeFileSync(path.join(prismaSchemaPath, "schema.prisma"), schemaContent.trim());

    fs.writeFileSync(
      path.join(prismasetupPath, "index.ts"), prismaClientContent.trim()
    );

    fs.writeFileSync(
      path.join(rootDir, ".env"),
      `DATABASE_URL="${dbUrl}"
        PORT=5000
        NODE_ENV=development`
    );

    fs.writeFileSync(
      path.join(rootDir, ".env.example"),
      `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
        PORT=5000
        NODE_ENV=development`
    );

    fs.writeFileSync(path.join(rootDir, "app", "api", "test-db", "route.ts"), postgreSqlRoute.trim());

    console.log(chalk.blue("\nInstalling @types/mongoose as dev dependency..."));
    await execa("npm", ["install", "prisma", "@prisma/client"], {
      cwd: rootDir,
      stdio: "inherit",
    });

    await execa("npm", ["install", "--save-dev", "typescript", "ts-node", "@types/node"], {
      cwd: rootDir,
      stdio: "inherit",
    });

    console.log(chalk.blue("Generating Prisma client..."));
    await execa("npx", ["prisma", "generate"], { cwd: rootDir, stdio: "inherit" });
    await execa("npm", ["prisma", "migrate", "dev",], { cwd: rootDir, stdio: "inherit" });
  }
}
