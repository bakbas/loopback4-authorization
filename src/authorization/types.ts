import {PermissionKey} from './permission-key';
import {UserProfile} from '@loopback/security';

export interface UserPermissionsFn {
    (
        userPermissions: PermissionKey[],
        requiredPermissions: RequiredPermissions,
    ): boolean;
}

export interface MyUserProfile extends UserProfile {
    permissions: PermissionKey[];
    email: string;
}

export interface RequiredPermissions {
    required: PermissionKey[];
}

export const UserProfileSchema = {
    type: 'object',
    required: ['email', 'password', 'fullName'],
    properties: {
        email: {
            type: 'string',
            format: 'email',
        },
        password: {
            type: 'string',
            minLength: 8,
        },
    },
};

export interface Credential {
    email: string;
    password: string;
    permissions: PermissionKey[];
}

export const CredentialsSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: {
            type: 'string',
            format: 'email',
        },
        password: {
            type: 'string',
            minLength: 8,
        },
    },
};

export const CredentialsRequestBody = {
    description: 'The input of login function',
    required: true,
    content: {
        'application/json': {schema: CredentialsSchema},
    },
};
