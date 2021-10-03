import {
  Controller,
  Post,
  Request,
  UseGuards,
  Body,
  Param,
  Get,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create.user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get('activate/:userId/:token')
  async activateAccount(
    @Param('token') token: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.activateAccount(token, userId);
  }
}
