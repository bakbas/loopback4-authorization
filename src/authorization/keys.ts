import {BindingKey} from '@loopback/context';
import {UserPermissionsFn} from './types';
import {TokenService} from '@loopback/authentication';
import {PasswordHasher} from './services/hash.password.bcryptjs';

/**
 * Binding keys used by this component.
 */
export namespace MyAuthBindings {
    export const USER_PERMISSIONS = BindingKey.create<UserPermissionsFn>(
        'userAuthorization.actions.userPermissions',
    );

    export const TOKEN_SERVICE = BindingKey.create<TokenService>(
        'services.authentication.jwt.tokenservice',
    );
}

export namespace TokenServiceConstants {
    export const TOKEN_SECRET_VALUE = '4pjdm6hwa1rbthxp6aq3';
    export const TOKEN_EXPIRES_IN_VALUE = '600';
}

export namespace PasswordHasherBindings {
    export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
        'services.hasher',
    );
    export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}
