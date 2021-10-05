import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
} from 'sequelize-typescript';
import { IUserAddress } from '../interfaces/IUserAddress';

@Table
export class UserAddress extends Model<IUserAddress> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  assetId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  address: string;
}
