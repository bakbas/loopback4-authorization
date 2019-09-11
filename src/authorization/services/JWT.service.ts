import {HttpErrors} from '@loopback/rest';
import {promisify} from 'util';
import {TokenService} from '@loopback/authentication';
import {securityId} from '@loopback/security';
import {TokenServiceConstants} from '../keys';
import {MyUserProfile, Credential} from '../types';
import {repository} from '@loopback/repository';
import {UserRepository} from '../../repositories';
import {User} from '../../models/user.model';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {}

    async verifyToken(token: string): Promise<MyUserProfile> {
        if (!token) {
            throw new HttpErrors.Unauthorized(
                `Error verifying token : 'token' is null`,
            );
        }

        let userProfile: MyUserProfile;

        try {
            // decode user profile from token
            const decodedToken = await verifyAsync(
                token,
                TokenServiceConstants.TOKEN_SECRET_VALUE,
            );
            // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
            userProfile = Object.assign(
                {[securityId]: '', name: '', email: '', permissions: ''},
                {
                    [securityId]: decodedToken.id,
                    name: decodedToken.name,
                    email: decodedToken.email,
                    permissions: decodedToken.permissions,
                },
            );
        } catch (error) {
            throw new HttpErrors.Unauthorized(
                `Error verifying token : ${error.message}`,
            );
        }
        return userProfile;
    }

    async generateToken(userProfile: MyUserProfile): Promise<string> {
        if (!userProfile) {
            throw new HttpErrors.Unauthorized(
                'Error generating token : userProfile is null',
            );
        }

        const userInfoForToken = {
            name: userProfile.name,
            email: userProfile.email,
        };
        // Generate a JSON Web Token
        let token: string;
        try {
            token = await signAsync(
                userInfoForToken,
                TokenServiceConstants.TOKEN_SECRET_VALUE,
                {
                    expiresIn: Number(
                        TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
                    ),
                },
            );
        } catch (error) {
            throw new HttpErrors.Unauthorized(
                `Error encoding token : ${error}`,
            );
        }

        return token;
    }

    async getToken(credential: Credential): Promise<string> {
        const foundUser = await this.userRepository.findOne({
            where: {email: credential.email},
        });
        if (!foundUser) {
            throw new HttpErrors['NotFound'](
                `User with email ${credential.email} not found.`,
            );
        }

        /*const passwordMatched = await this.passwordHasher.comparePassword(
            credentials.password,
            foundUser.password,
        );
        if (!passwordMatched) {
            throw new HttpErrors.Unauthorized(invalidCredentialsError);
        }*/

        if (credential.password !== foundUser.password) {
            throw new HttpErrors.Unauthorized(
                'The credentials are not correct.',
            );
        }

        /*const currentUser: UserProfile = _.pick(toJSON(foundUser), [
            'email',
            'fullName',
            'permissions',
        ]) as UserProfile;*/

        const token = await this.generateToken(
            this.convertToUserProfile(foundUser),
        );
        return token;
    }

    convertToUserProfile(user: User): MyUserProfile {
        // since first name and lastName are optional, no error is thrown if not provided
        let userName = '';
        if (user.firstName) userName = `${user.firstName}`;
        if (user.lastName)
            userName = user.firstName
                ? `${userName} ${user.lastName}`
                : `${user.lastName}`;
        return {
            [securityId]: user.id,
            name: userName,
            email: user.email,
            permissions: user.permissions,
        };
    }
}
