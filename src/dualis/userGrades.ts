export class UserGrades {
    public static deserialize(data: object): UserGrades {
        return new UserGrades();
    }

    grades: { [index: string] : string};

    constructor() {
        this.grades = {};
    }

    addGrade(name: string, value: string) {

    }


    serialize(): object {
        return {};
    }

}
