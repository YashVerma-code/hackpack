// setup-mongodb.js
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import inquirer from "inquirer";
import { dbConnectContent, envExampleContent, indexContent, packageJsonContent, PostgresindexContent, postgresJsonContent, schemaContent} from "./utils/utility.js";

export async function setupMongoDb(projectName) {
  console.log(
    chalk.blue("\nSetting up MongoDB backend with Express and JWT Auth...")
  );

  try {
    const { uri: mongoUri } = await inquirer.prompt([
      {
        type: "input",
        name: "uri",
        message: "Enter your MongoDB connection URI:",
        validate: (input) =>
          input.startsWith("mongodb")
            ? true
            : "Please enter a valid MongoDB URI",
      },
      //   jwtSecret : add this with mongoUri
      //   {
      //     type: "input",
      //     name: "jwtSecret",
      //     message: "Enter JWT secret key (or press Enter for auto-generated):",
      //     default: "myjwtsecretkey" + Math.random().toString(36).substring(2, 15),
      //   },
    ]);

    if (!mongoUri) {
      console.log(chalk.red("MongoDB URI is not provided."));
      return;
    }

    // Get the root directory (one level above current script dir)
    const rootDir = path.resolve(process.cwd());
    const backendPath = path.join(rootDir, "backend");
    const srcPath = path.join(backendPath, "src");
    const libPath = path.join(srcPath, "lib");
    const modelsPath = path.join(srcPath, "models");
    const routesPath = path.join(srcPath, "routes");
    const middlewarePath = path.join(srcPath, "middleware");

    // Create directories
    [
      backendPath,
      srcPath,
      libPath,
      modelsPath,
      routesPath,
      middlewarePath,
    ].forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
    });

    // Create package.json
    fs.writeFileSync(
      path.join(backendPath, "package.json"),
      JSON.stringify(packageJsonContent, null, 2)
    );

    // Create .env file
    fs.writeFileSync(
      path.join(backendPath, ".env"),
      `MONGO_URI=${mongoUri}
// JWT_SECRET=<add your JWT secret here>
// JWT_EXPIRE=7d
// JWT_REFRESH_EXPIRE=30d
PORT=5000
NODE_ENV=development`
    );

    // Create .env.example
    fs.writeFileSync(
      path.join(backendPath, ".env.example"),
      envExampleContent()
    );


    // Create all source files
    fs.writeFileSync(path.join(libPath, "dbconnect.js"), dbConnectContent());
    fs.writeFileSync(path.join(srcPath, "index.js"), indexContent);

    // Install dependencies
    console.log(chalk.blue("Installing dependencies..."));
    await execa("npm", ["install"], { cwd: backendPath, stdio: "inherit" });

    console.log(chalk.white("\n📋 Setup Summary:"));
    console.log(chalk.cyan("   Backend folder: ") + backendPath);
    console.log(chalk.cyan("   Environment: ") + ".env file created");
    console.log(chalk.cyan("   Database: ") + "MongoDB connection configured");
    console.log(chalk.cyan("   Authentication: ") + "JWT with refresh tokens");

    console.log(
      chalk.green("\n🚀 MongoDB backend with JWT Auth setup completed!")
    );

  } catch (error) {
    console.error(
      chalk.red("Error setting up MongoDB backend:"),
      error.message
    );
    console.log(chalk.yellow("You may need to finish setup manually."));
    console.log(
      chalk.yellow(
        "Check the error above and ensure all dependencies are available."
      )
    );
  }
}

export async function setupPostgreSQL(projectName) {
  console.log(chalk.blue("\nSetting up PostgreSQL backend with Prisma + Express..."));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Enter your PostgreSQL username:",
      default: "postgres",
    },
    {
      type: "password",
      name: "password",
      message: "Enter your PostgreSQL password:",
      mask: "*",
    },
    {
      type: "input",
      name: "host",
      message: "Enter your PostgreSQL host:",
      default: "localhost",
    },
    {
      type: "input",
      name: "port",
      message: "Enter your PostgreSQL port:",
      default: "5432",
      validate: (input) => (/^\d+$/.test(input) ? true : "Port must be a number"),
    },
    {
      type: "input",
      name: "database",
      message: "Enter your PostgreSQL database name:",
      default: "testdb",
    },
  ]);

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
  const { username, password, host, port, database } = answers;
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
  await execa("npm", ["prisma","migrate", "dev",], { cwd: backendPath, stdio: "inherit" });


  console.log(chalk.green("\n🚀 PostgreSQL backend with Prisma setup completed."));
}
