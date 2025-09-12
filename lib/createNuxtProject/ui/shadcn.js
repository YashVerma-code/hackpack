
export async function setupShadcnUI(projectName, languageChoice) {
    const projectPath = process.cwd();

    try {
        await execa("npm", ["install", "daisyui@latest"], {
            stdio: "inherit",
            shell: true,
        });
    } catch (error) {
        console.error(chalk.red("Error setting up daisyui:"), error.message);
        console.log(
            chalk.yellow(
                "You may need to set up daisyui manually after project creation."
            )
        );
    }
}
