import { Injectable } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';

@Injectable()
export class TokenService {
  private connection: Connection;
  private mint: PublicKey;

  constructor() {
    // Используем публичный RPC endpoint
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
    this.mint = new PublicKey('CreiuhfwdWCN5mJbMJtA9bBpYQrQF2tCBuZwSPWfpump')
  }

  async getTokenBalance(walletAddress: string): Promise<number> {
    try {
      // Создаем PublicKey из адресов
      const wallet = new PublicKey(walletAddress);

      // Находим адрес токен аккаунта
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(wallet, {
        mint: this.mint,
      });

      if (tokenAccounts.value.length === 0) {
        return 0; // Если токен аккаунт не найден, возвращаем 0
      }

      // Получаем баланс первого найденного токен аккаунта
      const balance = await this.connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
      
      return Number(balance.value.uiAmount);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }
}