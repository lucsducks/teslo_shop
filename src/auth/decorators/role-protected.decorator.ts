import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
export const META_ROLES = 'roles';



export function RoleProtected(...args: ValidRoles[]): MethodDecorator {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        SetMetadata(META_ROLES, args)(target, propertyKey, descriptor);
    };
}
