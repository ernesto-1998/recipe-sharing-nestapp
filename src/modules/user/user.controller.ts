import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UpdateUserDto,
  ResponseUserDto,
  PaginatedUsersResponseDto,
  ChangePasswordDto,
} from './dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto, PaginationQueryDto } from 'src/common/dto';
import { UserOwnerGuard } from 'src/common/guards/user-owner.guard';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { RequestContextService } from 'src/common/context/request-context.service';
import { CurrentUser } from '../auth/decorators';
import type { ITokenUser } from '../auth/interfaces';
import { ParseMongoIdPipe } from 'src/common/pipes';

@ApiExtraModels(ErrorResponseDto)
@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(
    private readonly requestCxt: RequestContextService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiOkResponsePaginated(ResponseUserDto)
  @Get()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    const baseUrl = this.requestCxt.getContext()?.full_url || '';
    return this.userService.findAll(paginationQuery, baseUrl);
  }

  @ApiOperation({ summary: 'Get an user by his username' })
  @ApiOkResponse({
    description: 'Successfully retrieved the user by his username',
    type: ResponseUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with this username does not exists.',
        error: 'Not Found',
      },
    },
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
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with this email does not exists.',
        error: 'Not Found',
      },
    },
  })
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<ResponseUserDto> {
    return await this.userService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Get an user by his ID' })
  @ApiOkResponse({
    description: 'Successfully retrieved the user by his ID',
    type: ResponseUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with this ID does not exists.',
        error: 'Not Found',
      },
    },
  })
  @Get(':id')
  async findById(
    @Param('id', ParseMongoIdPipe) id: string,
  ): Promise<ResponseUserDto> {
    return await this.userService.findById(id);
  }

  @UseGuards(UserOwnerGuard)
  @ApiOperation({ summary: 'Update an user' })
  @ApiOkResponse({
    description: 'Successfully retrieved the updated user.',
    type: ResponseUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with this ID does not exists.',
        error: 'Not Found',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email or username already in use.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email or username already in use.',
        error: 'Conflict',
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(UserOwnerGuard)
  @ApiOperation({ summary: 'Delete an user' })
  @ApiOkResponse({
    description: 'Successfully retrieved the deleted user.',
    type: ResponseUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with this ID does not exists.',
        error: 'Not Found',
      },
    },
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseMongoIdPipe) id: string,
  ): Promise<ResponseUserDto> {
    return await this.userService.remove(id);
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({
    description: 'Password successfully changed.',
    schema: {
      example: {
        message: 'Password successfully changed.',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid current password.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Current password is incorrect.',
        error: 'Unauthorized',
      },
    },
  })
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: ITokenUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.changePassword(user.userId, changePasswordDto);
    return { message: 'Password successfully changed.' };
  }
}
