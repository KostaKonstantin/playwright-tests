import { test as setup } from '../../fixtures/pom-fixtures';

// We don't even need the 'path' module anymore. 
const authFile = 'playwright/.auth/user.json'; 

setup('authenticate user', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(process.env.ORANGE_USERNAME!, process.env.ORANGE_PASSWORD!);
    await page.waitForURL(/.*dashboard/);

    // Save the state using the string path
    await page.context().storageState({ path: authFile });
});