import User from "./types/user";
import {DualisApi} from "./dualis/api";
import Log from "./log";
import {UserGrades} from "./dualis/userGrades";
import {Config} from "./config";
import * as utils from './utils';
import HopperApi from "./hopper/api";

export class CheckDaemon {
    private static log = new Log("CheckDaemon");
    private static running = false;

    static async runDaemon() {
        CheckDaemon.running = true;
        while (CheckDaemon.running) {
            let start = Date.now();
            await CheckDaemon.doDaemonRun();

            let time = Date.now() - start;

            CheckDaemon.log.info(`Daemon run took ${time} ms`);

            let fetchInterval = Config.instance.fetchInterval*1000;

            if (fetchInterval > time) {
                await new Promise(resolve => setTimeout(resolve, fetchInterval - time));
            }
        }
    }

    private static async doDaemonRun() {
        let users = await User.find();
        for (let usr of users) {
            let dualis = new DualisApi();

            if (!await dualis.login(usr.username, utils.decryptPassword(usr.password))) {
                CheckDaemon.log.error("Could not login user " + usr.username + "! Deleting user!");
                await User.deleteOne({username: usr.username});
                continue;
            }

            let grades = await dualis.getGrades();
            let diff = grades.getDiff(usr.grades);
            if (Object.entries(diff).length !== 0) {
                CheckDaemon.log.info(`Grades of user ${usr.username} got updated!`);

                let gradeStr = "";
                for (let subj in diff) {
                    gradeStr += `${subj}: ${diff[subj]}\n`
                }

                await HopperApi.postNotification(usr.subscription, {
                    heading: "Grades updated!",
                    timestamp: Date.now(),
                    actions: [],
                    type: "default",
                    content: gradeStr
                });
                await User.updateOne({username: usr.username}, {grades: grades.serialize()});
            }
        }
    }
}
