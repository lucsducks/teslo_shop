import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('/check')
  @Auth()
  checkAuthStatus(@GetUser() user: User,) {
    return this.authService.checkAuthStatus(user);
  }
  // @Get('/private')
  // @UseGuards(AuthGuard())
  // testingPrivateRoute(
  //   @GetUser() user: User,
  //   @GetUser('email') userEmail: String,
  //   @RawHeaders() headers: string[]

  // ) {
  //   console.log({ user });

  //   return { headers };
  // }
  // @Get('/private2')
  // // @SetMetadata('roles', ['admin', 'super-user'])
  // @RoleProtected(ValidRoles.superUser)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // privateRoute2(@GetUser() user: User) {
  //   return { user };
  // }
  // @Get('/private3')
  // @Auth(ValidRoles.user)
  // privateRoute3(@GetUser() user: User) {
  //   return { user };
  // }
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.authService.findOne(term);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
