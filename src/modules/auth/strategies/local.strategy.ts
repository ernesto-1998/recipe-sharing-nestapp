import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ITokenPayload } from '../interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<ITokenPayload> {
    const user = await this.authService.validateUser({
      email,
      password,
    });
    return user;
  }
}
