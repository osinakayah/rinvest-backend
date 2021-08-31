import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Address extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  publicAddress: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  index: number;
}
