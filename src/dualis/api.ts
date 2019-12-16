import * as request from "request";
import * as cheerio from "cheerio";
import { UserGrades } from "./userGrades";

export type DualisUser = {
    username: string,
    password: string
}

export class DualisApi {
    private sessionParams: string = "";
    private sessionCookie: string = "";

    async login(user: DualisUser): Promise<boolean> {
        let th = this;
        return new Promise<boolean>(function (resolve, error) {

            let x = request.post("https://dualis.dhbw.de/scripts/mgrqispi.dll", {
                form: {
                    usrname: user.username,
                    pass: user.password,
                    APPNAME: "CampusNet",
                    PRGNAME: "LOGINCHECK",
                    ARGUMENTS: "clino,usrname,pass,menuno,menu_type,browser,platform",
                    clino: "000000000000001",
                    menuno: "000000",
                    menu_type: "classic",
                    browser: "",
                    platform: ""
                }
            }, (error1, response, body) => {
                let $ = cheerio.load(body);

                if ($("h1").text() == "Benutzername oder Passwort falsch") {
                    resolve(false);
                    return;
                }

                // parse session args from redirect url
                let redUrl = response.headers.refresh!;
                th.sessionParams = redUrl.slice(redUrl.lastIndexOf("ARGUMENTS=") + 10, redUrl.lastIndexOf(',')) as string;

                th.sessionCookie = response.headers["set-cookie"]![0];
                resolve(true);
            });


        });
    }

    async getGrades(): Promise<UserGrades> {
        let th = this;
        return new Promise<UserGrades>(function (resolve, error) {
            let x = request.get("https://dualis.dhbw.de/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=STUDENT_RESULT&ARGUMENTS=" + th.sessionParams + ",-N0,-N000000000000000,-N000000000000000,-N000000000000000,-N0,-N000000000000000", {
                headers: {
                    "cookie": th.sessionCookie
                }
            }, (error1, response, body) => {
                let table = cheerio.load(body)("tbody").first();
                let x = table.children("tr:not(.subhead)");
                let grades = new UserGrades();
                x.each((_, row) => {
                    let ch = cheerio(row);
                    if (ch.children().first().attr("colspan") == "2" || ch.children().first().hasClass("level00")) return;
                    let gName = ch.children(":nth-child(2)");
                    if (gName.children().length == 0) {
                        grades.addGrade(gName.text()!.trim(), "");
                    } else {
                        let subj = gName.children().first().text().trim();
                        let grade = ch.children(":nth-child(5)").text().trim();
                        grades.addGrade(subj, grade);
                    }
                });
                resolve(grades);
            });
        });
    }
}
