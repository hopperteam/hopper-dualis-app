import * as fs from "fs";

export namespace Config {

    export function parseConfig(file: string) {
        instance = new ConfigHolder(JSON.parse(fs.readFileSync(file).toString()));
    }

    class ConfigHolder {
        readonly dbHost: string;
        readonly dbUser: string;
        readonly dbPassword: string;
        readonly dbName: string;
        readonly dbPort: number;
        readonly port: number;

        constructor(data: any) {
            this.dbHost = data.dbHost;
            this.dbPassword = data.dbPassword;
            this.dbUser = data.dbUser;
            this.dbName = data.dbName;
            this.dbPort = data.dbPort || 27017;
            this.port = data.port || 80;

            if (this.dbHost == undefined || this.dbUser == undefined || this.dbPassword == undefined || this.dbName == undefined) {
                throw new Error("Config incomplete!");
            }
        }
    }

    export let instance: ConfigHolder;
}
