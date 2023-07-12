import { ClientPlatform } from "./common/constant";

export interface AccessSsoJwtPayload {
    // jti: string;
    // sub: {
    //     auth: string;
    //     user: string;
    //     username: string;
    //     platform: ClientPlatform;
    //     systemRole: SystemRole;
    // };
    // exp?: number;
    iat: number;
    jti: string;
    sub: string;
    scope: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface RefreshJwtPayload {
    jti: string;
    sub: {
        auth: string;
        user: string;
        username: string;
        platform: ClientPlatform;
    };
    exp?: number;
}
