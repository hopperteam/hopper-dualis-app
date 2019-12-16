import * as express from 'express';
import * as mongoose from 'mongoose';
import bodyParser = require('body-parser');
import Log from './log';
import { Config } from "./config";
import HopperApi from './hopper/api';

const log = new Log("DualisApp");

import GeneralHandler from './handler/generalHandler';

class DualisApp {

    private server: express.Application;

    constructor() {
        this.server = express();
        this.server.use(express.static("web", { 'extensions': ['html'] }));
        this.server.use(bodyParser.urlencoded({extended: true}));
    }

    private async loadConfig(): Promise<boolean> {
        try {
            if (!process.argv[2]) {
                log.error("Please provide a config file.");
                return false;
            } else {
                log.info("Loading config from " + process.argv[2]);
                Config.parseConfig(process.argv[2]);
                if (Config.instance.appId == "") {
                    Config.instance.appId = await HopperApi.registerApp();
                }
                Config.updateConfig(process.argv[2]);
            }
        } catch (e) {
            log.error("Could not start: " + e.toString());
            return false;
        }
        return true;
    }

    private async init(): Promise<boolean> {
        try {
            await mongoose.connect(`mongodb://${Config.instance.dbHost}:${Config.instance.dbPort}/${Config.instance.dbName}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
                user: Config.instance.dbUser,
                pass: Config.instance.dbPassword
            });
        } catch (e) {
            log.error("Could not connect to DB (" + e.message + ")");
            return false;
        }

        //setInterval(AuthMiddleware.daemon, 60000);

        this.server.use(new GeneralHandler().getRouter());

        return true;
    }

    public async start(): Promise<void> {
        if (!(await this.loadConfig() && await this.init())) {
            log.error("Could not initalize app");
            return;
        }

        this.server.listen(Config.instance.port, () => {
            log.info("Server listening on port: " + Config.instance.port);
        });
    }
}

const app = new DualisApp();
app.start();
