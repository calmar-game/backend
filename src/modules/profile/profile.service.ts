import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity/user.entity';
import { CharacterClass } from '../users/enums/character-class.enum';
import { UserService } from '../users/user.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  async getProfileByUserId(userId: number) {
    console.log('id from sub: ', userId);
    const users = await this.userRepository.find({
      where: { id: userId },
    });

    console.info('users', users);

    if (!users[0]) {
      throw new NotFoundException('User not found');
    }

    console.log('current user from sub: ', users[0]);
    const user = users[0];

    const energyUser = await this.userService.setEnergy(user.walletAddress);
    console.info(energyUser)
    return {
      ...energyUser,
      isProfileCompleted: !!user.username,
    };
  }


  async updateProfile(userId: number, username: string, characterClass: CharacterClass) {
    if (!username || username.length < 3 || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('Invalid username');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.username = username;
    user.characterClass = characterClass;

    await this.userRepository.save(user);

    return {
      ...user,
      isProfileCompleted: true,
    };
  }
}