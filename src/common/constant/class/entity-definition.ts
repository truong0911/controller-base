import { EntityDefinitionDto } from "@common/dto/entity-definition/entity-definition.dto";
import { ExportDefinitionDto } from "@common/dto/entity-definition/export-definition.dto";
import { ImportDefinitionDto } from "@common/dto/entity-definition/import-definition.dto";
import { Type } from "@nestjs/common";

const ENTITY_DEFINITION_KEY = "entity:definition";

type EntityDefinitionFieldProps = Omit<
    EntityDefinitionDto,
    "field" | "propertyTarget" | "type" | "children"
>;

class EntityDefinitionLoader {
    private addDefinition = (target: any, definition: EntityDefinitionDto) => {
        const importList: EntityDefinitionDto[] =
            Reflect.getMetadata(ENTITY_DEFINITION_KEY, target.constructor) ||
            [];
        importList.push(definition);
        Reflect.defineMetadata(
            ENTITY_DEFINITION_KEY,
            importList,
            target.constructor,
        );
    };

    field(props: EntityDefinitionFieldProps) {
        return (target: any, propertyKey: string) => {
            const propertyTarget = Reflect.getMetadata(
                "design:type",
                target,
                propertyKey,
            );
            const definition: EntityDefinitionDto = {
                field: propertyKey,
                propertyTarget,
                type: propertyTarget.name,
                ...props,
            };
            this.addDefinition(target, definition);
        };
    }

    getImportDefinition(entity: Type): ImportDefinitionDto[] {
        const res: EntityDefinitionDto[] =
            Reflect.getMetadata(ENTITY_DEFINITION_KEY, entity) || [];
        return res
            .filter((definition) => definition.disableImport !== true)
            .map((definition) => {
                const { disableImport, propertyTarget, ...importDefinition } =
                    definition;
                disableImport;
                propertyTarget;
                return importDefinition;
            });
    }

    getExportDefinition(
        entity: Type,
        parentData: Pick<ExportDefinitionDto, "fields" | "labels"> = {
            fields: [],
            labels: [],
        },
    ): ExportDefinitionDto[] {
        const definitions: EntityDefinitionDto[] =
            Reflect.getMetadata(ENTITY_DEFINITION_KEY, entity) || [];
        const res = definitions.map((definition) => {
            const { field, label, required, propertyTarget, type } = definition;
            const fields = parentData.fields.concat(field);
            const labels = parentData.labels.concat(label);
            const children: ExportDefinitionDto[] = this.getExportDefinition(
                propertyTarget,
                { fields, labels },
            );
            const exportDefinition: ExportDefinitionDto = {
                field,
                label,
                fields,
                labels,
                required,
                type,
                children,
            };
            return exportDefinition;
        });
        return res;
    }
}

const EntityDefinition: EntityDefinitionLoader =
    global.EntityDefinition ||
    (global.EntityDefinition = new EntityDefinitionLoader());

export { EntityDefinition };
