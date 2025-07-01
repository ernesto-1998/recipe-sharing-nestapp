// user.controller.ts
import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ITokenUser } from '../auth/interfaces';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: ITokenUser,
  ): Promise<ResponseUserDto> {
    if (user.userId !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseUserDto> {
    return await this.userService.remove(id);
  }

  @Get()
  async findAll(): Promise<ResponseUserDto[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ResponseUserDto> {
    return await this.userService.findById(id);
  }

  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<ResponseUserDto> {
    return await this.userService.findByUsername(username);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<ResponseUserDto> {
    return await this.userService.findByEmail(email);
  }
}
