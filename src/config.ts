import * as fs from "fs";
import * as utils from './utils';
import HopperApi from './hopper/api';

export namespace Config {

    export function parseConfig(file: string) {
        instance = new ConfigHolder(JSON.parse(fs.readFileSync(file).toString()));
    }

    export function updateConfig(file: string) {
        fs.writeFileSync(file, JSON.stringify(instance));
    }

    class ConfigHolder {
        readonly dbHost: string;
        readonly dbUser: string;
        readonly dbPassword: string;
        readonly dbName: string;
        readonly dbPort: number;
        readonly port: number;
        readonly hopperBaseUrl: string;
        readonly passphrase: string;
        readonly privateKey: string;
        readonly publicKey: string;
        appId: string;

        constructor(data: any) {
            if (!data.dbHost || !data.dbUser || !data.dbPassword || !data.dbName || !data.passphrase || !data.hopperBaseUrl) {
                throw new Error("Config incomplete!");
            }

            this.dbHost = data.dbHost;
            this.dbPassword = data.dbPassword;
            this.dbUser = data.dbUser;
            this.dbName = data.dbName;
            this.dbPort = data.dbPort || 27017;
            this.port = data.port || 80;
            this.hopperBaseUrl = data.hopperBaseUrl;
            this.passphrase = data.passphrase;
            this.appId = data.appId || "";

            if (!data.privateKey || !data.publicKey) {
                let keypair: any = utils.getKeyPair(this.passphrase);
                this.privateKey = keypair.privateKey;
                this.publicKey = keypair.publicKey;
            } else {
                this.privateKey = data.privateKey;
                this.publicKey = data.publicKey;
            }
        }
    }

    export let instance: ConfigHolder;
}
