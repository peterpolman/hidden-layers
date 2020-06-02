import { User } from '@/models/User';

export class Account extends User {
    email: string;

    constructor(uid: string, data: any) {
        super(uid, data);

        this.email = data.email;
    }
}
