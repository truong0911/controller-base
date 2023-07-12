import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { Configuration } from "@config/configuration";
import { AccessSsoJwtPayload } from "@module/auth/auth.interface";
import { InjectRedisClient } from "@module/redis/redis-client.provider";
import { SsoService } from "@module/sso/sso.service";
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import Redis from "ioredis";

@Injectable()
export class JwtSsoGuard implements CanActivate {
    private JWKS_CERTS_KEY = "jwts:certs";
    constructor(
        private readonly configService: ConfigService<Configuration>,
        private readonly ssoService: SsoService,
        @InjectRedisClient()
        private readonly redis: Redis,
    ) {}

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>();
        const bearer = req.headers.authorization;
        let success = true;
        // Lấy token và verify với JWKS
        try {
            // Map payload SSO
            const payload = await this.ssoService.verify(bearer);
            const { usernameField, emailField, firstNameField, lastNameField } =
                this.configService.get("sso", { infer: true });

            const ssoPayload: AccessSsoJwtPayload = {
                jti: payload.jti,
                iat: payload.iat,
                sub: payload.sub,
                scope: String(payload.scope),
                username:
                    payload[usernameField] &&
                    String(payload[usernameField]).toLowerCase(),
                email:
                    payload[emailField] &&
                    String(payload[emailField]).toLowerCase(),
                firstName:
                    payload[firstNameField] &&
                    String(payload[firstNameField]).trim(),
                lastName:
                    payload[lastNameField] &&
                    String(payload[lastNameField]).trim(),
            };

            // Khởi tạo RequestAuthData
            const requestAuthData = new RequestAuthData(ssoPayload, () => {
                return this.ssoService.initUser(ssoPayload);
            });
            req.user = requestAuthData;
        } catch (err) {
            success = false;
        }
        if (success) {
            return true;
        } else {
            throw new UnauthorizedException();
        }
    }
}
