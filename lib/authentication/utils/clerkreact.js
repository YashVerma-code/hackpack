import inquirer from "inquirer";
import { appContent, HomePageComponent, mainFileContent, ProtectedRouteContent, SignInReactPage, SignUpReactPage } from "./utility.js";
import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";

export async function setupViteReactClerk(framework, projectName, language, styling, useTailwind, uiLibrary) {
    const daisy = "daisyui" === uiLibrary;
    const shadcn = "shadcn" === uiLibrary;
    const heroui = "heroui" === uiLibrary;
    try {
        const targetDir = path.resolve(projectName);
        const currentDir = process.cwd();

        if (currentDir !== targetDir) {
            if (fs.existsSync(targetDir)) {
                process.chdir(targetDir);
                console.log(chalk.blue(`Changed working directory to project: ${projectName}`));
            } else {
                console.error(chalk.red(`Directory "${projectName}" does not exist.`));
                // Optional: process.exit(1);
            }
        }

        console.log(chalk.blue(`Installing clerk package...`));

        const rootDir = path.resolve(process.cwd());
        await execa("npm", ["install", "@clerk/clerk-react"], { cwd: rootDir, stdio: "inherit" });

        console.log(chalk.blue(`Installing react-router-dom ....`));
        await execa("npm", ["install", "react-router-dom"], {
            cwd: rootDir, stdio: "inherit"
        });

        const srcDir = path.join(rootDir, "src");
        const componentsDir = path.join(srcDir, "components");
        if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
        if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir);

        const envFilePath = path.join(rootDir, ".env");
        fs.writeFileSync(envFilePath, `VITE_CLERK_PUBLISHABLE_KEY=`);

        // Main.jsx/tsxx file setup
        const mainFilePath = path.join(srcDir, `main.${language === 'ts' ? 'tsx' : 'jsx'}`);
        const mainFilecontent = mainFileContent(language);
        fs.writeFileSync(mainFilePath, mainFilecontent);

        const appFilePath = path.join(srcDir, `App.${language === 'ts' ? 'tsx' : 'jsx'}`)
        fs.writeFileSync(appFilePath, appContent);

        const protectedRoutePath = path.join(srcDir, "components", `ProtectedRoute.${language === 'ts' ? 'tsx' : 'jsx'}`);
        const protectedRoutecontent = ProtectedRouteContent(language);
        fs.writeFileSync(protectedRoutePath, protectedRoutecontent)

        const homePagePath = path.join(srcDir, "components", `HomePage.${language === 'ts' ? 'tsx' : 'jsx'}`);
        const homePageContent = HomePageComponent(useTailwind, daisy, heroui, shadcn);
        fs.writeFileSync(homePagePath, homePageContent);

        const signInPagePath = path.join(srcDir, "components", `SignInPage.${language === 'ts' ? 'tsx' : 'jsx'}`);
        const signInPageContent = SignInReactPage(useTailwind)
        fs.writeFileSync(signInPagePath, signInPageContent);

        const signUpPagePath = path.join(srcDir, "components", `SignUpPage.${language === 'ts' ? 'tsx' : 'jsx'}`);
        const signUpPageContent = SignUpReactPage(useTailwind);
        fs.writeFileSync(signUpPagePath, signUpPageContent)

        console.log(chalk.green.bold(`🎉✅ Clerk setup completed successfully! ✅🎉\nYour app is now configured with Clerk authentication .\nYou can now start your app!🚀`));
        console.log(chalk.yellow('Update your VITE_CLERK_PUBLISHABLE_KEY in .env.local'));

    } catch (error) {
        console.error(chalk.red("Error setting up Clerk for authentication"), error.message);
        console.log(chalk.yellow("You may need to finish clerk setup manually."));
    }

}