import * as fs from "fs";
import * as utils from './utils';
import * as crypto from 'crypto';

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
        readonly baseUrl: string;
        readonly hopperBaseUrl: string;
        readonly passphrase: string;
        readonly privateKey: string;
        readonly publicKey: string;
        readonly fetchInterval: number;
        readonly accessProtocol: string;
        readonly tokenCreationPassword: string;
        appId: string;
        creationTokens: { [ index: string ]: boolean } = {};

        constructor(data: any) {
            if (!data.dbHost || !data.dbUser || !data.dbPassword || !data.dbName || !data.passphrase || !data.baseUrl || !data.hopperBaseUrl || !data.accessProtocol || !data.tokenCreationPassword) {
                throw new Error("Config incomplete!");
            }

            this.dbHost = data.dbHost;
            this.dbPassword = data.dbPassword;
            this.dbUser = data.dbUser;
            this.dbName = data.dbName;
            this.dbPort = data.dbPort || 27017;
            this.port = data.port || 80;
            this.baseUrl = data.baseUrl;
            this.accessProtocol = data.accessProtocol;
            this.hopperBaseUrl = data.hopperBaseUrl;
            this.passphrase = data.passphrase;
            this.fetchInterval = data.fetchInterval || 60*5;
            this.appId = data.appId || "";
            this.tokenCreationPassword = data.tokenCreationPassword;

            if (!data.privateKey || !data.publicKey) {
                let keypair: any = utils.getKeyPair(this.passphrase);
                this.privateKey = keypair.privateKey;
                this.publicKey = keypair.publicKey;
            } else {
                this.privateKey = data.privateKey;
                this.publicKey = data.publicKey;
            }
        }

        generateNewToken(): string {
            let tk = crypto.randomBytes(8).toString('hex');
            this.creationTokens[tk] = true;
            return tk;
        }

        tryToUseToken(tk: string): boolean {
            if (tk in this.creationTokens) {
                delete this.creationTokens.tk;
                return true;
            }
            return false;
        }
    }

    export let instance: ConfigHolder;
}
