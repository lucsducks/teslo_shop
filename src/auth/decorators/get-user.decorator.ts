import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest().user;
    if(!req) throw new InternalServerErrorException('User not found in request');
    if(data === 'email') return req[data];
    if(data === 'id') return req[data];
    return req;
});

export const RawHeaders = createParamDecorator((data, ctx: ExecutionContext) =>{
    const req = ctx.switchToHttp().getRequest().rawHeaders;
    return req;
});