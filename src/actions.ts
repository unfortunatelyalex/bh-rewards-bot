import puppeteer, { Browser } from "puppeteer";
import Config from "./config.js";
import Cookies from "./cookies.js";
import { Users } from "./users.js";
import { Watcher } from "./watcher.js";

export default class Action {
    private readonly browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    /**
     * Executes an action with a new browser. Don't have to worry about handling the browser here.
     * @param mode the action to be executed.
     */
    static async autoExecute(mode: string = Config.mode) {
        const browser = await puppeteer.launch({
            headless: Config.headless,
            executablePath: Config.browserPath
        });

        const action = new Action(browser);
        await action.autoAction(mode);

        await browser.close();
    }

    /**
     * Executes an action based on the given mode string.
     * @param mode string indicating what action should be executed.
     */
    async autoAction(mode: string = Config.mode) {
        switch (mode) {
            case 'farm': await this.farm(); break;
            case 'harvest': await this.harvest(); break;
            case 'register': await this.register(); break;
            case 'login': await this.login(); break;
        }
    }

    /**
     * Starts Brawlhalla streams and farms for rewards (for every user).
     */
    async farm() {
        const users = new Users();
        for (const user of users.users) {
            // don't start blocked users (or users that don't exist yet)
            if (user.blocked || !user.registered) continue;
            // login and watch
            const watcher = new Watcher(this.browser, user.name, user.password);
            await watcher.login();
            await watcher.watch();
            if (await watcher.isBlocked()) {
                console.log(`Oh no! ${user.name} is blocked!`);
                user.blocked = true;
                users.save();
                await watcher.stopWatching();
                continue;
            }
            console.log(`${user.name} is farming.`);
        }
        // TODO: wait until the end of stream
    }

    async register() {
        // TODO: register
    }

    /**
     * Logs all users into Twitch.
     */
    async login() {
        const users = new Users();
        for (const user of users.users) {
            // skip users where we already got the cookies
            const cookiesPath = `./cookies/cookies-${user.name}.json`;
            const cookies = Cookies.readFromFile(cookiesPath);
            if (cookies.exist()) continue;
            // don't start users that don't exist yet
            if (!user.registered) continue;
            // login
            const watcher = new Watcher(this.browser, user.name, user.password);
            await watcher.login();
            // don't want to wait for the screenshot
            if (Config.debug) watcher.screenshot();
        }
        console.log("All users logged in.");
    }

    /**
     * Starts brawlhalla streams and harvests the codes (for all users).
     */
    async harvest() {
        const users = new Users();
        for (const user of users.users) {
            // don't start users that don't exist yet
            if (!user.registered) continue;
            const watcher = new Watcher(this.browser, user.name, user.password);
            await watcher.login();
            await watcher.watch();
            // TODO: harvest codes
            console.log(`${user.name} harvesting.`);

            // don't want to wait for the screenshot
            if (Config.debug) watcher.screenshot();
        }
    }
}