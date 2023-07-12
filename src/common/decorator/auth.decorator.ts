import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { JwtSsoGuard } from "@common/guard/jwt-sso.guard";
import { SystemRoleGuard } from "@common/guard/system-role.guard";
import { ApiError } from "@config/exception/api-error";
import { AccessSsoJwtPayload } from "@module/auth/auth.interface";
import { SystemRole } from "@module/user/common/constant";
import { User } from "@module/user/entities/user.entity";
import {
    applyDecorators,
    createParamDecorator,
    ExecutionContext,
    SetMetadata,
    UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";

export const AllowSystemRoles = (...systemRoles: SystemRole[]) => {
    return SetMetadata("system-roles", systemRoles);
};

export const Authorization = () =>
    applyDecorators(
        UseGuards(
            // JwtAuthGuard,
            JwtSsoGuard,
            SystemRoleGuard,
        ),
        ApiBearerAuth(),
    );

export const ReqPayload = createParamDecorator(
    async (
        prop: keyof AccessSsoJwtPayload,
        ctx: ExecutionContext,
    ): Promise<AccessSsoJwtPayload | unknown> => {
        const request = ctx.switchToHttp().getRequest<Request>();
        if (request.user instanceof RequestAuthData) {
            const requestAuth = request.user as RequestAuthData;
            const payload = requestAuth.getPayload();
            return prop ? payload && payload[prop] : payload;
        }
        return undefined;
    },
);

export const ReqUser = createParamDecorator(
    async (prop: keyof User, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        let user: any;
        if (request.user instanceof RequestAuthData) {
            const requestAuth = request.user as RequestAuthData;
            user = await requestAuth.getUser();
            if (!user) {
                throw ApiError.Unauthorized("error-unauthorized");
            }
        } else {
            user = request.user;
        }
        return prop ? user && user?.[prop] : user;
    },
);
