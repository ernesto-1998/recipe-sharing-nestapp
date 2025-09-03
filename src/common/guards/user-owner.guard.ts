import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { BaseOwnerGuard } from './base-owner.guard';

@Injectable()
export class UserOwnerGuard extends BaseOwnerGuard {
  constructor(private readonly userService: UserService) {
    super(userService, '_id');
  }
}
