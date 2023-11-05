import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles:string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());
    if(!validRoles) return true;
    if(validRoles.length === 0) return true;
    const user = context.switchToHttp().getRequest().user as User;
    if(!user) throw new BadRequestException('User not found in request');
    for (const role of user.roles) {
      if(validRoles.includes(role)) return true;      
    }
    throw new ForbiddenException('You do not have permission to access this resource');
  }
}
