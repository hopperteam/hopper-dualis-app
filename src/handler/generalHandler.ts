import * as express from 'express';
import Handler from './handler';
import Log from '../log';
import * as utils from '../utils';
import User, { IUser } from '../types/user';
import {DualisApi} from "../dualis/api";
import HopperApi from '../hopper/api';
import { Config } from '../config';

const log: Log = new Log("GeneralHandler");

export default class GeneralHandler extends Handler {

    constructor() {
        super();
        this.router.get("/", this.ping.bind(this));
        this.router.post("/register", this.register.bind(this));
        this.router.post("/deleteUser", this.deleteUser.bind(this));
        this.router.get("/callback", this.callback.bind(this));
        this.router.get("/token", this.getToken.bind(this));
    }

    private async ping(req: express.Request, res: express.Response): Promise<void> {
        log.info("Pinged by a user");
        res.json({
            "app": "DualisServiceProvider"
        });
    }

    private async register(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (!Config.instance.tryToUseToken(req.body.token))
                throw new Error("Not authorized");

            if (await User.findOne({ username: req.body.username }))
                throw new Error("Username is already in use");

            let api = new DualisApi();
            if (!await api.login(req.body.username, req.body.password)) {
                throw new Error("Invalid dualis credentials");
            }

            req.body.password = utils.encryptPassword(req.body.password);

            await User.create(req.body);
            await HopperApi.subscribeUser(req.body.username, res);
        } catch (e) {
            console.log(e);
            utils.handleError(e, log, res);
        }
    }

    private async deleteUser(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (!req.body.password)
                throw new Error("Invalid data!");

            let usr = await User.findOne({ username: req.body.username});
            if (!usr)
                throw new Error("Invalid user data");

            if (utils.decryptPassword(usr.password) !== req.body.password) {
                throw new Error("Invalid user data");
            }

            await User.findOneAndDelete({ username: req.body.username});

            utils.returnMessage("Success!", res);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }

    private async callback(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (req.query.status == "error")
                throw new Error("User did not authorize");
            log.info(`User ${req.query.username} authenticated!`);
            let user: IUser | null = await User.findOneAndUpdate({ username: req.query.username }, { subscription: req.query.id });
            if (!user)
                throw new Error("Invalid user data");
            utils.returnMessage("Success!", res);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }

    private async getToken(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (req.query.password != Config.instance.tokenCreationPassword)
                throw new Error("Not authorized");
            let token = Config.instance.generateNewToken();
            res.end(token);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }
}
