import * as express from 'express';
import * as rp from 'request-promise-native';
import { Config } from '../config';
import * as utils from '../utils';
import Log from '../log';

const log = new Log("HopperApi");

export default class HopperApi {
    public static async registerApp(): Promise<string> {

        let obj = {
            "name": "DualisApp",
            "baseUrl": Config.instance.accessProtocol + "://" + Config.instance.baseUrl,
            "imageUrl": "https://pbs.twimg.com/profile_images/394388290/logo_400x400.jpg",
            "manageUrl": Config.instance.accessProtocol + "://" + Config.instance.baseUrl,
            "contactEmail": "support@hoppercloud.net",
            "cert": Buffer.from(Config.instance.publicKey, ).toString('base64')
        };

        let options = {
            method: 'POST',
            uri: Config.instance.hopperBaseUrl + "/api/v1/app",
            body: obj,
            json: true
        };

        let res = await rp(options);
        if (res.status == "error")
            throw new Error("Could not get appId because " + res.reason);
        return res.id;
    }

    public static async subscribeUser(username: string, res: express.Response): Promise<void> {
        var callback = Config.instance.accessProtocol + "://" + Config.instance.baseUrl + '/callback?username=' + username;
        var subscribeRequest = { id: Config.instance.appId, callback: callback, accountName: username, requestedInfos: [] };

        var content = utils.encryptContent(subscribeRequest);
        res.redirect(Config.instance.hopperBaseUrl + '/subscribe?id=' + encodeURIComponent(Config.instance.appId) + '&content=' + encodeURIComponent(content));
    }

    public static async postNotification(subscriptionId: string, notification: Notification) {
        let options = {
            method: 'POST',
            uri: Config.instance.hopperBaseUrl + "/api/v1/notification",
            body: {
                subscriptionId: subscriptionId,
                notification: notification
            },
            json: true
        };

        let res = await rp(options);
    }
}

export type Notification = {
    readonly heading: string;
    readonly timestamp: number;
    readonly type: string;
    readonly content: any;
    readonly actions: object[];
}
