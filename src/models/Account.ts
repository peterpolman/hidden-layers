import { User } from '@/models/User';

export class Account extends User {
    email: string;
    hashes: any;
    lockCamera: boolean;

    constructor(uid: string, data: any) {
        super(uid, data);
        this.email = data.email;
        this.hashes = data.hashes;
        this.lockCamera = data.lockCamera;
    }
}
