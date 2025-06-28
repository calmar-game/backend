import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity/user.entity';
import { LeaderboardPlayerDto } from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getTopPlayers(limit = 10) : Promise<LeaderboardPlayerDto[]> {
    const users = await this.userRepository.find({
      order: { score: 'DESC' },
      take: limit,
      select: ['username', 'score'],
    });

    return users.map((user, index) => ({
        id: user.id,
        rank: index + 1,
        username: user.username, 
        score: this.formatScore(user.score),
    }));
  }

  private formatScore(score: number): string {
    if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
    if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
    return `${score}`;
  }
}