import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Token extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  token: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  purpose: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  expiration: string;
}
