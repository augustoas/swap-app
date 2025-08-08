import { Module } from '@nestjs/common';
import { TycService } from './tyc.service';
import { TycController } from './tyc.controller';
import { TermsAndConditions } from '../database/entities/termsAndConditions.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [TycController],
  providers: [TycService],
  imports: [AuthModule, TypeOrmModule.forFeature([TermsAndConditions])],
})

export class TycModule {}
