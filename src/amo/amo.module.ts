import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth';
import { PrismaModule } from '../prisma';
import { AmoService } from './amo.service';
import { AmoController } from './amo.controller';

@Module({
  imports: [AuthModule, HttpModule, ConfigModule, PrismaModule],
  controllers: [AmoController],
  providers: [AmoService],
})
export class AmoModule {}
