import {BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserEntity} from './entity/user.entity';
import {UpdateUserDto} from './dto/update-user.dto';
import {EnergyCacheService} from "../cash/energy-cache.service";
import {GameStartResponseDto} from "./dto/game-start-response.dto";
import {UpdateScoreDto} from "./dto/UpdateScoreDto";
import {UserDto} from "./dto/user.dto";
import {InventoryEntity} from "../inventory/entity/inventory.entity";
import {ItemsService} from "../items/items.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
    private readonly itemService: ItemsService,
    private readonly energyService: EnergyCacheService
  ) {}

  async createUser(walletAddress: string, username: string): Promise<UserEntity> {
    const existingByWallet = await this.userRepo.findOne({ where: { walletAddress } });
    if (existingByWallet) {
      throw new ConflictException(`Пользователь с кошельком ${walletAddress} уже существует.`);
    }
    const existingByUsername = await this.userRepo.findOne({ where: { username } });
    if (existingByUsername) {
      throw new ConflictException(`Пользователь с именем ${username} уже существует.`);
    }
    const user = await this.userRepo.save({ walletAddress, username});
    const inventory = await this.inventoryRepo.save({userId: user.id, itemId: 1});
    user.inventory = [inventory]
    return this.userRepo.save(user);
  }
  async findByWallet(walletAddress: string): Promise<UserEntity> {
    return this.userRepo.findOne({ where: { walletAddress } });
  }

  async getUser(id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async getUserByWallet(wallet: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: { walletAddress: wallet },
      relations: ['inventory', 'inventory.item','equippedSkin'] // загружаем инвентарь и связанные предметы
    });
    if (!user) {
      throw new NotFoundException(`User with wallet ${wallet} not found`);
    }
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUser(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async saveUser(user: UserEntity): Promise<UserEntity> {
    return this.userRepo.save(user);
  }

  // Получаем текущую и максимальную энергию (если хотим пересчитывать на лету – пример)
  async getEnergy(wallet: string): Promise<{ energyCurrent: number; energyMax: number }> {
    const user = await this.userRepo.findOne({ where: { walletAddress:wallet } });
    return { energyCurrent: user.energyCurrent, energyMax: user.energyMax };
  }

  // Обновляем счёт (очки)
  async updateScore(wallet: string, data: UpdateScoreDto): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { walletAddress:wallet } });
    user.gameCoins = data.newGem;
    user.level = data.level;
    user.levelInd = data.levelInd;
    return this.userRepo.save(user);
  }

  async startGame(wallet: string): Promise<GameStartResponseDto> {
    const user = await this.userRepo.findOne({
      where: { walletAddress: wallet },
      relations: ['inventory', 'inventory.item'] // загружаем инвентарь и связанные предметы
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с кошельком ${wallet} не найден`);
    }

    if (user.energyCurrent >= 1) {
      // Регистрируем трату энергии в кэше
      this.energyService.addSpentEnergy(user.id, user.energyCurrent);
      // Уменьшаем энергию
      user.energyCurrent--;
      const updatedUser = await this.userRepo.save(user);
      return { success: true, user: updatedUser };
    }
    return { success: false, user: user };
  }

  async equipSkin(wallet: string, skinName: string): Promise<UserDto> {
    // Получаем пользователя с инвентарем и экипированным скином
    const user = await this.userRepo.findOne({
      where: { walletAddress: wallet },
      relations: ['inventory', 'inventory.item', 'equippedSkin'],
    });

    if (!user) {
      throw new NotFoundException(`User with wallet ${wallet} not found`);
    }

    // Проверяем, что скин присутствует в инвентаре пользователя.
    // Так как дефолтный скин уже добавлен в инвентарь при создании,
    // пользователь всегда имеет хотя бы один скин.
    const inventorySkin = user.inventory.find(inv => inv.item && inv.item.name === skinName);
    if (!inventorySkin) {
      throw new BadRequestException(`Скин с названием "${skinName}" не найден в инвентаре пользователя`);
    }

    // Обновляем активный скин: всегда может быть надет только один.
    user.equippedSkin = inventorySkin.item

    return this.userRepo.save(user);
  }

  async buyItem(wallet: string, itemName: string): Promise<UserDto> {
    // 1) Получаем пользователя
    const user = await this.userRepo.findOne({
      where: { walletAddress: wallet },
      relations: ['inventory', 'inventory.item'],
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с кошельком ${wallet} не найден`);
    }

    // 2) Находим айтем по имени
    const item = await this.itemService.findByName(itemName);
    if (!item) {
      throw new NotFoundException(`Айтем с именем "${itemName}" не найден`);
    }

    // 3) Проверяем достаточность gameCoins
    if (user.gameCoins < item.price) {
      throw new BadRequestException(
        `Недостаточно игровых монет. Нужно ${item.price}, а у пользователя ${user.gameCoins}`
      );
    }

    // 4) Проверяем, есть ли уже такая запись в инвентаре
    let existingInventory = user.inventory.find(
      (inv) => inv.itemId === item.id
    );
    if (!existingInventory) {
      // Если не найдено, создаём новую запись
      const newInv = this.inventoryRepo.create({
        userId: user.id,
        itemId: item.id,
      });
      await this.inventoryRepo.save(newInv);
    } else {
        throw new ConflictException(`Пользователь уже имеет айтем "${itemName}"`);
    }

    // 5) Списываем стоимость айтема
    user.gameCoins -= item.price;
    await this.userRepo.update(user.id,{gameCoins: user.gameCoins});

    // 6) Возвращаем обновлённые данные пользователя в формате DTO
    return await this.userRepo.findOne({
      where: {id: user.id},
      relations: ['inventory', 'inventory.item', 'equippedSkin'],
    });
  }
}
