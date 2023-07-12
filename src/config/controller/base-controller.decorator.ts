import {
    AllowSystemRoles,
    Authorization,
} from "@common/decorator/auth.decorator";
import {
    BaseControllerConfig,
    BaseRoute,
} from "@config/controller/base-controller.interface";
import { SystemRole } from "@module/user/common/constant";
import { Delete, Get, Patch, Post, Put, applyDecorators } from "@nestjs/common";

export const BaseControllerSetup = (config: BaseControllerConfig) => {
    const decorators: ClassDecorator[] = [];

    const authorization = config?.authorize ?? true;
    if (authorization) {
        decorators.push(Authorization());
        const controllerRoles = config?.roles;
        if (controllerRoles) {
            decorators.push(AllowSystemRoles(...controllerRoles));
        }
    }

    return applyDecorators(...decorators);
};

const BaseRoutePath: { [key in BaseRoute]: string } = {
    create: "",
    getById: ":id",
    getMany: "many",
    getPage: "page",
    updateById: ":id",
    deleteById: ":id",
    importDefinition: "import/definition",
    importXlsxTemplate: "import/template/xlsx",
    importValidate: "import/validate",
    importInsert: "import/insert",
    exportDefinition: "export/definition",
    exportXlsx: "export/xlsx",
};

export const BaseRouteSetup = (
    route: BaseRoute,
    config: BaseControllerConfig,
    method: "get" | "post" | "put" | "patch" | "delete",
) => {
    const routeConfig = config?.routes?.[route] || {};

    const enable = routeConfig.enable ?? true;
    if (!enable) {
        return applyDecorators();
    }
    const importRoute: BaseRoute[] = [
        "importDefinition",
        "importXlsxTemplate",
        "importValidate",
        "importInsert",
    ];

    const useImport = config.import?.enable ?? true;
    if (importRoute.includes(route) && useImport !== true) {
        return applyDecorators();
    }

    const decorators: MethodDecorator[] = [];
    const authorization = config?.authorize ?? true;
    if (authorization) {
        const routeRoles = routeConfig.roles ||
            config?.roles || [SystemRole.ADMIN];
        if (routeRoles) {
            decorators.push(AllowSystemRoles(...routeRoles));
        }
    }

    const path = BaseRoutePath[route] ?? "undefined";

    switch (method) {
        case "get": {
            decorators.push(Get(path));
            break;
        }
        case "post": {
            decorators.push(Post(path));
            break;
        }
        case "put": {
            decorators.push(Put(path));
            break;
        }
        case "patch": {
            decorators.push(Patch(path));
            break;
        }
        case "delete": {
            decorators.push(Delete(path));
            break;
        }
        default: {
            break;
        }
    }
    return applyDecorators(...decorators);
};
