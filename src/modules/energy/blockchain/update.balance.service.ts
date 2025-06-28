import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBalanceService {
  private balances: { [wallet: string]: number } = {}; // Кэш для хранения текущих балансов

  async getTokenBalances(wallets: string[]): Promise<{ [wallet: string]: number }> {
    const balances: { [wallet: string]: number } = {};

    for (const wallet of wallets) {
      if (!(wallet in this.balances)) {
        // Если кошелек впервые запрашивается, генерируем случайный баланс
        this.balances[wallet] = Math.floor(Math.random() * 100);
      } else {
        // В 80% случаев возвращаем старый баланс
        if (Math.random() < 0.8) {
          balances[wallet] = this.balances[wallet];
        } else {
          // В 20% случаев меняем баланс случайно в пределах ±10%
          const delta = Math.floor(Math.random() * 20 - 10); // от -10 до +10
          this.balances[wallet] = Math.max(0, this.balances[wallet] + delta);
          balances[wallet] = this.balances[wallet];
        }
      }
    }

    return balances;
  }
}
