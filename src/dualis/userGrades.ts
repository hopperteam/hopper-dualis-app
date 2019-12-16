export class UserGrades {
    public static deserialize(data: object): UserGrades {
        return new UserGrades(data);
    }

    grades: { [index: string] : string};

    constructor(gr: object = {}) {
        this.grades = gr as { [index: string] : string};
    }

    addGrade(name: string, value: string) {
        this.grades[name] = value;
    }

    getDiff(oldGrades: { [index: string] : string} ): { [index: string] : string} {
        let updateSet: { [index: string] : string} = {};

        for (let subj in this.grades) {
            if (!(subj in oldGrades) || oldGrades[subj] !== this.grades[subj]) {
                updateSet[subj] = this.grades[subj];
            }
        }
        return updateSet;
    }

    serialize(): object {
        return this.grades;
    }

}
