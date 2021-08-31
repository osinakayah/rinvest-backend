import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/models/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [AddressService],
})
export class AddressModule {}
