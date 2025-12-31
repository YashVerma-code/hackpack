// setup-mongodb.js
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import inquirer from "inquirer";
import { apiContent, dbConnectContent, dbConnectContentNuxt, envExampleContent, indexContent, mongodbNextContent, packageJsonContent, PostgresindexContent, postgresJsonContent, postgreSqlRoute, prismaClientContent, schemaContent, svelteApiRouteContent, svelteMongoDbContent, sveltePackageJsonMongo, sveltePackageJsonPostgres, sveltePostgresApiContent, sveltePrismaContent, svelteUserModelContent, tsConfigContent, userModel } from "./utils/utility.js";

export async function setupMongoDb(projectName, framework, language) {
  console.log(
    chalk.blue("\nSetting up MongoDB backend ...")
  );

  const { uri: mongoUri } = await inquirer.prompt([
    {
      type: "input",
      name: "uri",
      message: "Enter your MongoDB connection URI:",
      default: "mongodb://localhost:27017/test",
      validate: (input) =>
        input.startsWith("mongodb")
          ? true
          : "Please enter a valid MongoDB URI",
    },
  ]);
  const { dbname } = await inquirer.prompt([
    {
      type: "input",
      name: "dbname",
      message: "Enter your database name:"
    }
  ])

  if (!mongoUri) {
    console.log(chalk.red("MongoDB URI is not provided."));
    return;
  }

  if (framework === "next") {
    console.log(chalk.blue("\nSetting up for Next.js project..."));
    try {
      process.chdir(projectName);
      const rootDir = path.resolve(process.cwd());
      const libPath = path.join(rootDir, "lib");
      const actionPath = path.join(libPath, "actions");
      const databasePath = path.join(libPath, "database");
      const nextmodelPath = path.join(databasePath, "models");
      [
        rootDir,
        libPath,
        actionPath,
        databasePath,
        nextmodelPath
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // console.log("Mongo uri : ", mongoUri)
      const mongoNextContent = mongodbNextContent(framework, language);
      if (!mongoNextContent) {
        console.error("Missing mongodbNextContent definition.");
        return;
      }
      fs.writeFileSync(
        path.join(databasePath, `mongoose.${language === 'ts' ? 'ts' : 'js'}`), mongoNextContent.trim()
      );

      // Create .env file
      fs.writeFileSync(
        path.join(rootDir, ".env.local"),
        `MONGO_URI=${mongoUri}\nDB_NAME=${dbname}\nPORT=5000\nNODE_ENV=development # Set to 'production' in production environment\n`.trim()
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(rootDir, ".env.example"),
        envExampleContent()
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      console.log(chalk.blue("Installing @types/mongoose as dev dependency..."));

      await execa("npm", ["install", "--save-dev", "@types/mongoose"], {
        cwd: rootDir,
        stdio: "inherit",
      });

    } catch (error) {
      console.error(
        chalk.red("Error setting up MongoDB backend :)"),
        error.message
      );
      console.log(chalk.yellow("You may need to finish setup manually."));
      console.log(
        chalk.yellow(
          "Check the error above and ensure all dependencies are available."
        )
      );
    }

  } else if (framework === "svelte") {
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
        path.join(databasePath, `mongoose.${language === 'ts' ? 'ts' : 'js'}`),
        svelteMongoDbContent.trim()
      );

      // Create User model
      fs.writeFileSync(
        path.join(modelsPath, `User.model.${language === 'ts' ? 'ts' : 'js'}`),
        svelteUserModelContent.trim()
      );

      // Create API route for users
      fs.writeFileSync(
        path.join(routesPath, `+server.${language === 'ts' ? 'ts' : 'js'}`),
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
        `MONGO_URI=${mongoUri}\nNODE_ENV=development\nCLIENT_URL=your_client_url_here`
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
  } else if (framework === "astro") {
    console.log(chalk.blue(`\nSetting up for mongodb connection for ${projectName} project...`));
    try {
      const rootDir = path.resolve(process.cwd());
      const libPath = path.join(rootDir, "src", "lib");
      const actionPath = path.join(libPath, "actions");
      const databasePath = path.join(libPath, "database");
      const nextmodelPath = path.join(databasePath, "models");

      [
        rootDir,
        libPath,
        actionPath,
        databasePath,
        nextmodelPath
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // console.log("Mongo uri : ", mongoUri)
      const mongoNextContent = mongodbNextContent(framework, language);
      if (!mongoNextContent) {
        console.error("Missing mongodbNextContent definition.");
        return;
      }
      fs.writeFileSync(
        path.join(databasePath, `mongoose.${language === 'ts' ? 'ts' : 'js'}`), mongoNextContent.trim()
      );

      // Create .env file
      fs.writeFileSync(
        path.join(rootDir, ".env.local"),
        `MONGODB_URI=\nDB_NAME=\nPORT=5000\nNODE_ENV=development\n`.trim()
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(rootDir, ".env.example"),
        envExampleContent()
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      if (language === "ts") {
        console.log(chalk.blue("Installing @types/mongoose as dev dependency..."));

        await execa("npm", ["install", "--save-dev", "@types/mongoose"], {
          cwd: rootDir,
          stdio: "inherit",
        });
      } else {
        console.log(chalk.blue("Installing mongoose..."));
        await execa("npm", ["install", "mongoose"], { cwd: rootDir, stdio: "inherit" });
      }
      console.log(chalk.green("\n✅ Astro MongoDB setup complete!\n"));

    } catch (error) {
      console.error(
        chalk.red("Error setting up MongoDB backend :)"),
        error.message
      );
      console.log(chalk.yellow("You may need to finish setup manually."));
      console.log(
        chalk.yellow(
          "Check the error above and ensure all dependencies are available."
        )
      );
    }
  } else if (framework === "nuxt") {
    console.log(chalk.blue(`\nSetting up for mongodb connection for ${projectName} nuxt project...`));
    try {
      const rootDir = path.resolve(process.cwd());
      const serverPath = path.join(rootDir, "server");
      const apiPath = path.join(serverPath, "api");
      const databasePath = path.join(serverPath, "database");
      const modelPath = path.join(databasePath, "models");

      [
        rootDir,
        serverPath,
        apiPath,
        databasePath,
        modelPath
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      const mongodbContent = dbConnectContentNuxt(language);
      if (!mongodbContent) {
        console.error("Missing mongodbNuxtContent definition.");
        return;
      }
      fs.writeFileSync(
        path.join(databasePath, `mongoose.${language === 'ts' ? 'ts' : 'js'}`), mongodbContent.trim()
      );

      // Create .env file
      fs.writeFileSync(
        path.join(rootDir, ".env"),
        `MONGODB_URI=${mongoUri}\nDB_NAME=${dbname}\nNODE_ENV=development\n`.trim()
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      await execa("npm", ["i", "--save-dev", "@types/node"], {
        cwd: rootDir, stdio: "inherit"
      });

      if (language === "ts") {
        console.log(chalk.blue("Installing @types/mongoose as dev dependency..."));

        await execa("npm", ["install", "--save-dev", "@types/mongoose"], {
          cwd: rootDir,
          stdio: "inherit",
        });

      } else {
        console.log(chalk.blue("Installing mongoose..."));
        await execa("npm", ["install", "mongoose"], { cwd: rootDir, stdio: "inherit" });
      }

    } catch (error) {
      console.error(
        chalk.red("Error setting up MongoDB backend :)"),
        error.message
      );
      console.log(chalk.yellow("You may need to finish setup manually."));
      console.log(
        chalk.yellow(
          "Check the error above and ensure all dependencies are available."
        )
      );
    }
  } else {
    try {
      // Get the root directory (one level above current script dir)
      const rootDir = path.resolve(process.cwd());
      const backendPath = path.join(rootDir, "backend");
      const srcPath = path.join(backendPath, "src");
      const libPath = path.join(srcPath, "lib");
      const modelPath = path.join(srcPath, "models");
      const routesPath = path.join(srcPath, "routes");
      const controllerPath = path.join(srcPath, "controller");
      const middlewarePath = path.join(srcPath, "middleware");

      // Create directories
      [
        backendPath,
        srcPath,
        libPath,
        modelPath,
        routesPath,
        controllerPath,
        middlewarePath,
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // Create package.json
      const pkgJsonContent = packageJsonContent(language);
      fs.writeFileSync(
        path.join(backendPath, "package.json"),
        JSON.stringify(pkgJsonContent, null, 2)
      );

      // Create .env file
      fs.writeFileSync(
        path.join(backendPath, ".env"),
        `MONGO_URI=${mongoUri}\nPORT=5000\nNODE_ENV=development\n`
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(backendPath, ".env.example"),
        envExampleContent()
      );

      if (language === "ts") {
        fs.writeFileSync(
          path.join(backendPath, "tsconfig.json"),
          JSON.stringify(tsConfigContent, null, 2)
        );
      }
      // Create all source files
      const dbConnectContent2 = dbConnectContent(language);
      const indexContent2 = indexContent(language);
      fs.writeFileSync(path.join(libPath, `dbconnect.${language === "ts" ? 'ts' : 'js'}`), dbConnectContent2);
      fs.writeFileSync(path.join(srcPath, `index.${language === "ts" ? 'ts' : 'js'}`), indexContent2);

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: backendPath, stdio: "inherit" });

    } catch (error) {
      console.error(
        chalk.red("Error setting up MongoDB backend :)"),
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
}

// PostgreSql Setup function
export async function setupPostgreSQL(projectName, framework) {
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

  if (framework === "next") {
    process.chdir(projectName);
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
    const { username, password, host, port, database } = answers;
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
  else if (framework === "svelte") {
    console.log(chalk.blue("\nSetting up for SvelteKit project..."));
    try {
      process.chdir(projectName);
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
      const { username, password, host, port, database } = answers;
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
  else {
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
    await execa("npm", ["prisma", "migrate", "dev",], { cwd: backendPath, stdio: "inherit" });


    console.log(chalk.green("\n🚀 PostgreSQL backend with Prisma setup completed."));
  }

}
