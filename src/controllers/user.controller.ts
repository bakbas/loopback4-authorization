import {repository} from '@loopback/repository';
import {post, get, patch, del, requestBody} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {inject, Getter} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {
    MyUserProfile,
    Credential,
    MyAuthBindings,
    PermissionKey,
    CredentialsRequestBody,
    UserProfileSchema,
    JWTService,
} from '../authorization';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';

export class UserController {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @inject(MyAuthBindings.TOKEN_SERVICE)
        public jwtService: JWTService,
        @inject.getter(AuthenticationBindings.CURRENT_USER)
        public getCurrentUser: Getter<MyUserProfile>,
    ) {}

    /**
     * create user
     * @param user user
     */
    @post('/users', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {'application/json': {schema: {'x-ts-type': User}}},
            },
        },
    })
    async create(@requestBody() user: User): Promise<User> {
        user.permissions = [
            PermissionKey.ViewOwnUser,
            PermissionKey.CreateUser,
            PermissionKey.UpdateOwnUser,
            PermissionKey.DeleteOwnUser,
        ];
        if (await this.userRepository.exists(user.email)) {
            throw new HttpErrors.BadRequest(`This email already exists`);
        } else {
            const savedUser = await this.userRepository.create(user);
            delete savedUser.password;
            return savedUser;
        }
    }

    /**
     * user login
     * @param credentials email and password
     */
    @post('/users/login', {
        responses: {
            '200': {
                description: 'Token',
                content: {},
            },
        },
    })
    async login(
        @requestBody(CredentialsRequestBody) credential: Credential,
    ): Promise<{token: string}> {
        const token = await this.jwtService.getToken(credential);
        return {token};
    }

    /**
     * show current user
     */
    @get('/users/me', {
        responses: {
            '200': {
                description: 'The current user profile',
                content: {
                    'application/json': {
                        schema: UserProfileSchema,
                    },
                },
            },
        },
    })
    @authenticate('jwt', {required: [PermissionKey.ViewOwnUser]})
    async printCurrentUser(): Promise<MyUserProfile> {
        return this.getCurrentUser();
    }

    /**
     * update user
     * @param user user
     */
    @patch('/users', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {'application/json': {schema: {'x-ts-type': User}}},
            },
        },
    })
    @authenticate('jwt', {required: [PermissionKey.ViewOwnUser]})
    async updateUser(@requestBody() user: Partial<User>): Promise<void> {
        const currentUser = await this.getCurrentUser();
        return await this.userRepository.updateById(currentUser.email, user);
    }

    /**
     * show current user
     */
    @get('/users', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {'application/json': {schema: {'x-ts-type': User}}},
            },
        },
    })
    @authenticate('jwt', {required: [PermissionKey.ViewOwnUser]})
    async findById(): Promise<User> {
        const currentUser = await this.getCurrentUser();
        return await this.userRepository.findById(currentUser.email);
    }

    /**
     * delete current user
     */
    @del('/users', {
        responses: {
            '204': {
                description: 'User DELETE success',
            },
        },
    })
    @authenticate('jwt', {required: [PermissionKey.DeleteOwnUser]})
    async deleteById(): Promise<void> {
        const currentUser = await this.getCurrentUser();
        await this.userRepository.deleteById(currentUser.email);
    }
}
