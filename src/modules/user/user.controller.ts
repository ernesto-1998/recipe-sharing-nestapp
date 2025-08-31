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
import { UpdateUserDto, ResponseUserDto } from './dto';
import { IsOwnerGuard } from 'src/common/guards/is-owner.guard';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';

@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id')
  @UseGuards(IsOwnerGuard)
  @ApiOperation({ summary: 'Update an user' })
  @ApiOkResponse({
    description: 'Successfully retrieved the updated user.',
    type: ResponseUserDto,
  })
  @ApiConflictResponse({
    description: 'Conflict - Email or username already in use.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(IsOwnerGuard)
  @ApiOperation({ summary: 'Delete an user' })
  @ApiOkResponse({
    description: 'Successfully retrieved the deleted user.',
    type: ResponseUserDto,
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseUserDto> {
    return await this.userService.remove(id);
  }

  @Public()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Successfully retrieved an array of users.',
    type: ResponseUserDto,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<ResponseUserDto[]> {
    return await this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get an user by his ID' })
  @ApiOkResponse({
    description: 'Successfully retrieved the user by his ID',
    type: ResponseUserDto,
  })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ResponseUserDto> {
    return await this.userService.findById(id);
  }

  @ApiOperation({ summary: 'Get an user by his username' })
  @ApiOkResponse({
    description: 'Successfully retrieved the user by his username',
    type: ResponseUserDto,
  })
  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<ResponseUserDto> {
    return await this.userService.findByUsername(username);
  }

  @ApiOperation({ summary: 'Get an user by his email' })
  @ApiOkResponse({
    description: 'Successfully retrieved the user by his email',
    type: ResponseUserDto,
  })
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<ResponseUserDto> {
    return await this.userService.findByEmail(email);
  }
}
