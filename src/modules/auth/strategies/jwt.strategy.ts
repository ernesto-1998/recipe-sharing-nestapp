import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ITokenPayload, ITokenUser } from '../interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    if (configService.get<string>('JWT_SECRET') === undefined) {
      throw new Error('JWT_SECRET environment variable is not defined.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  validate(payload: ITokenPayload): ITokenUser {
    return {
      userId: payload.sub,
      username: payload.username,
      isSuperUser: payload.isSuperUser,
    };
  }
}
