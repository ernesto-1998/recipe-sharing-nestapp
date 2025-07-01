import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { UserService } from '../user/user.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload, ITokenUser } from './interfaces/';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(input: LoginDto): Promise<ITokenUser> {
    const user = await this.userService.checkIfUserExistsByEmail(input.email);
    if (user) {
      const match = await bcrypt.compare(input.password, user.password);
      if (match) {
        const userRes = user.toObject();
        return {
          userId: userRes._id.toHexString(),
          username: userRes.username,
        };
      }
    }
    throw new UnauthorizedException('Invalid credentials.');
  }

  async logIn(user: ITokenUser): Promise<AuthResponseDto> {
    const sub = user.userId;
    const tokenPayload: ITokenPayload = {
      sub,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return { accessToken, userId: user.userId, username: user.username };
  }
}
