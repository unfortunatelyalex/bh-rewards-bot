import fs from 'fs';

export interface User {
    name: string,
    password: string,
    registered: boolean,
    blocked: boolean
}

export class Users {
    readonly #jsonPath = "users.json";
    #users: User[];

    constructor() {
        if (!fs.existsSync(this.#jsonPath)) {
            this.#users = [];
            return;
        }

        this.#users = JSON.parse(fs.readFileSync(this.#jsonPath, 'utf-8'));
    }

    save() {
        fs.writeFileSync(this.#jsonPath, JSON.stringify(this.#users, null, 4));
    }

    printAll() {
        for (const user of this.#users) {
            console.log(`name: ${user.name}\npassword: ${user.password}\nregistered: ${user.registered}\n`)
        }
    }


    public get users(): User[] {
        return this.#users;
    }

}