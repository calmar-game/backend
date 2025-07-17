import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';

@Injectable()
export class GameService {
  constructor(private readonly userService: UserService) {}

  async userHasAccess(userId: string): Promise<boolean> {
    const user = await this.userService.findById(+userId);
    // return !!user && user.isVerified;
    return !!user;
  }
}