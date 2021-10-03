import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
} from 'sequelize-typescript';
import { IUserMnemonic } from '../interfaces/IUserMnemonic';

@Table
export class UserMnemonic extends Model<IUserMnemonic> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  id: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  mnemonic: string;
}
