import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import {IUser} from "../interfaces/IUser";
import {InventoryEntity} from "../../inventory/entity/inventory.entity";
import {ItemEntity} from "../../items/entity/item.entity";


@Entity()
export class UserEntity implements IUser{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  walletAddress: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: 10 })
  energyCurrent: number;

  @Column({ default: 10 })
  energyMax: number;

  @Column({ default: 0 })
  gameCoins: number;

  @Column({ default: 0 })
  score: number;

  @Column({default: 0})
  level: number;

  @Column({default:0})
  levelInd:number;

  @Column({nullable: true ,default:1})
  equippedSkinId?: number;

  @ManyToOne(() => ItemEntity, { nullable: true })
  @JoinColumn({ name: 'equippedSkinId' })
  equippedSkin?: ItemEntity;

  @OneToMany(() => InventoryEntity, inv => inv.user)
  inventory: InventoryEntity[];
}
