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
import { ITokenUser } from './interfaces';
import { CurrentUser } from './current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: ITokenUser): Promise<AuthResponseDto> {
    return await this.authService.logIn(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return await this.userService.create(createUserDto);
  }
}
