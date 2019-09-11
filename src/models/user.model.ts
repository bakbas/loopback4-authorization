import {Entity, model, property} from '@loopback/repository';

@model({
    settings: {
        indexes: {
            uniqueEmail: {
                keys: {
                    email: 1,
                },
                options: {
                    unique: true,
                },
            },
        },
    },
})
export class User extends Entity {
    @property({
        type: 'string',
        id: true,
    })
    id: string;

    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
        required: true,
    })
    password: string;

    @property({
        type: 'string',
    })
    firstName?: string;

    @property({
        type: 'string',
    })
    lastName?: string;

    @property.array(String)
    permissions: String[];

    constructor(data?: Partial<User>) {
        super(data);
    }
}
