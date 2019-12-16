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

    serialize(): object {
        return this.grades;
    }

}
