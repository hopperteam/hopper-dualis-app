type DualisUser = {
    username: string,
    password: string
}

class DualisApi {
    async getGradesFor(user: DualisUser): Promise<UserGrades> {
        return new UserGrades();
    }
}
