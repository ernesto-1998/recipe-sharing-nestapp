import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, ResponseUserDto } from '../../user/dto';
import { UserService } from '../../user/services/user.service';
import { AuthResponseDto, LoginDto } from '../dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import type { ITokenUser } from '../interfaces';
import { CurrentUser } from '../decorators';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Log in to the app.' })
  @ApiOkResponse({
    description: 'Successfully Logged in.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials.' })
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() _loginDto: LoginDto,
    @CurrentUser() user: ITokenUser,
  ): Promise<AuthResponseDto> {
    return await this.authService.logIn(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Creates a new user.' })
  @ApiCreatedResponse({
    description: 'Successfully created a new user.',
    type: ResponseUserDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data.' })
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return await this.userService.create(createUserDto);
  }
}
