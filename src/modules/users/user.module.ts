import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {EnergyCacheModule} from "../cash/energy-cash.module";
import {ItemsModule} from "../items/items.module";
import {InventoryEntity} from "../inventory/entity/inventory.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity]),EnergyCacheModule,ItemsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
