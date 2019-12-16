import * as express from 'express';
import * as rp from 'request-promise-native';
import { Config } from '../config';
import * as utils from '../utils';
import Log from '../log';

const log = new Log("HopperApi");

export default class HopperApi {
    public static async registerApp(): Promise<boolean> {

        let obj = {
            "name": "DualisApp",
            "baseUrl": "https://dualis.dhbw.de",
            "imageUrl": "https://pbs.twimg.com/profile_images/394388290/logo_400x400.jpg",
            "manageUrl": "https://dualis.dhbw.de",
            "contactEmail": "support@hoppercloud.net",
            "cert": Config.instance.publicKey
        }

        let options = {
            method: 'POST',
            uri: Config.instance.hopperBaseUrl + "/api/v1/app",
            body: obj,
            json: true
        };

        let res = await rp(options);
        if (res.status == "error") {
            log.info("Could not app because " + res.reason);
            return false;
        }
        return true;
    }

    public static async subscribeUser(username: string, res: express.Response): Promise<boolean> {
        var callback = null;
        //var subscribeRequest = { id: Config.instance.appId, callback: callback, accountName: username, requestedInfos: [] };

        //var content = utils.encryptContent(subscribeRequest);

        //res.redirect(Config.instance.hopperBaseUrl + '/subscribe?id=' + encodeURIComponent(Config.instance.appId) + '&content=' + encodeURIComponent(content));

        return true;
    }
}
