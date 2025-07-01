import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ITokenPayload } from './interfaces';
import { CurrentUser } from './current-user.decorator';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: ITokenPayload): Promise<AuthResponseDto> {
    return await this.authService.logIn(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return await this.userService.create(createUserDto);
  }
}
