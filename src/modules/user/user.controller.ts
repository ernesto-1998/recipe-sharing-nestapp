// user.controller.ts
import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { IsOwnerGuard } from 'src/common/guards/is-owner.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id')
  @UseGuards(IsOwnerGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(IsOwnerGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseUserDto> {
    return await this.userService.remove(id);
  }

  @Public()
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
