import {
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, AuthResponseDto } from '../dto';
import { UserService } from '../../user/services/user.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload, ITokenUser } from '../interfaces/';
import type { AppLogger } from 'src/common/interfaces/app-logger.interface';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { UserRolesLevel } from 'src/common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
  ) {}

  async validateUser(input: LoginDto): Promise<ITokenUser> {
    const user = await this.userService.checkIfUserExistsByEmail(input.email);
    if (user) {
      const match = await bcrypt.compare(input.password, user.password);
      if (match) {
        const userRes = user.toObject();
        this.logger.log(
          {
            message: 'User successfully authenticated',
            userId: userRes._id.toHexString(),
            username: userRes.username,
            isSuperUser: userRes.role === UserRolesLevel.SUPERUSER,
          },
          AuthService.name,
          HttpStatus.OK,
        );
        return {
          userId: userRes._id.toHexString(),
          username: userRes.username,
          isSuperUser: userRes.role === UserRolesLevel.SUPERUSER,
        };
      }
    }
    this.logger.warn(
      {
        message: 'Invalid credentials attempt',
        email: input.email,
      },
      AuthService.name,
      HttpStatus.UNAUTHORIZED,
    );
    throw new UnauthorizedException('Invalid credentials.');
  }

  async logIn(user: ITokenUser): Promise<AuthResponseDto> {
    const sub = user.userId;
    const tokenPayload: ITokenPayload = {
      sub,
      username: user.username,
      isSuperUser: user.isSuperUser,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    this.logger.log(
      {
        message: 'Access token issued',
        userId: user.userId,
      },
      AuthService.name,
      HttpStatus.OK,
    );
    return { accessToken, userId: user.userId, username: user.username };
  }
}
