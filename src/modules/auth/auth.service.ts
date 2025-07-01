import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { UserService } from '../user/user.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload } from './interfaces/';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(input: LoginDto): Promise<ITokenPayload> {
    const user = await this.userService.checkIfUserExistsByEmail(input.email);
    if (user) {
      const match = await bcrypt.compare(input.password, user.password);
      if (match) {
        const userRes = user.toObject();
        return {
          sub: userRes._id.toHexString(),
          username: userRes.username,
        };
      }
    }
    throw new UnauthorizedException('Invalid credentials.');
  }

  async logIn(user: ITokenPayload): Promise<AuthResponseDto> {
    const userId = user.sub;
    const tokenPayload: ITokenPayload = {
      sub: userId,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return { accessToken, username: user.username, userId };
  }
}
