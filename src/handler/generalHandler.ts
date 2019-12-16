﻿import * as express from 'express';
import Handler from './handler';
import Log from '../log';
import * as utils from '../utils';
import User, { IUser } from '../types/user';
import {DualisApi} from "../dualis/api";
import HopperApi from '../hopper/api';

const log: Log = new Log("GeneralHandler");

export default class GeneralHandler extends Handler {

    constructor() {
        super();
        this.router.get("/", this.ping.bind(this));
        this.router.post("/register", this.register.bind(this));
        this.router.post("/updatePassword", this.resetPassword.bind(this));
        this.router.post("/deleteUser", this.deleteUser.bind(this));
        this.router.get("/callback", this.callback.bind(this));
    }

    private async ping(req: express.Request, res: express.Response): Promise<void> {
        log.info("Pinged by a user");
        res.json({
            "app": "DualisServiceProvider"
        });
    }

    private async register(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (await User.findOne({ username: req.body.username }))
                throw new Error("Username is already in use");

            let api = new DualisApi();
            if (!await api.login(req.body.username, req.body.password)) {
                throw new Error("Invalid dualis credentials");
            }

            req.body.password = utils.encryptPassword(req.body.password);
            await User.create(req.body);
            HopperApi.subscribeUser(req.body.username, res);
            utils.returnMessage("Success!", res);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }

    private async resetPassword(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (!req.body.oldPassword || !req.body.newPassword)
                throw new Error("oldPassword and newPassword cannot be nothing");
            let oldPassword: string = utils.encryptPassword(req.body.oldPassword);
            let newPassword: string = utils.encryptPassword(req.body.newPassword);
            let user: IUser | null = await User.findOneAndUpdate({ username: req.body.username, password: oldPassword }, { password: newPassword });
            if (!user)
                throw new Error("Invalid user data");
            utils.returnMessage("Success!", res);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }
    private async deleteUser(req: express.Request, res: express.Response): Promise<void> {
        try {
            let password: string = utils.encryptPassword(req.query.password);
            let user: IUser | null = await User.findOneAndDelete({ username: req.query.username, password: password });
            if (!user)
                throw new Error("Invalid user data");
            utils.returnMessage("Success!", res);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }

    private async callback(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (req.query.status == "error")
                throw new Error("User did not authorize");
            let user: IUser | null = await User.findOneAndUpdate({ username: req.body.username }, { subscription: req.query.subscriptionId });
            if (!user)
                throw new Error("Invalid user data");
            utils.returnMessage("Success!", res);
        } catch (e) {
            utils.handleError(e, log, res);
        }
    }
}
