import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, AuthResponseDto } from './dto';
import { UserService } from '../user/user.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload, ITokenUser } from './interfaces/';
import type { AppLogger } from 'src/common/interfaces/app-logger.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AppLogger') private readonly logger: AppLogger,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
          },
          AuthService.name,
        );
        return {
          userId: userRes._id.toHexString(),
          username: userRes.username,
        };
      }
    }
    this.logger.warn(
      {
        message: 'Invalid credentials attempt',
        email: input.email,
      },
      AuthService.name,
    );
    throw new UnauthorizedException('Invalid credentials.');
  }

  async logIn(user: ITokenUser): Promise<AuthResponseDto> {
    const sub = user.userId;
    const tokenPayload: ITokenPayload = {
      sub,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    this.logger.log(
      {
        message: 'Access token issued',
        userId: user.userId,
      },
      AuthService.name,
    );
    return { accessToken, userId: user.userId, username: user.username };
  }
}
