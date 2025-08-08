import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsAndConditions } from '../entities/termsAndConditions.entity';
import { Seeder, DataFactory } from 'nestjs-seeder';

@Injectable()
export class TYCSeeder implements Seeder {
  constructor(
    @InjectRepository(TermsAndConditions) private readonly termsAndConditionsRepository: Repository<TermsAndConditions>,
  ) {}

  async seed(): Promise<any> {
    const tycs = DataFactory.createForClass(TermsAndConditions).generate(10);
    for (const index in tycs) {
      const newTyc = this.termsAndConditionsRepository.create(tycs[index]);
      await this.termsAndConditionsRepository.save(newTyc);
    }
  }

  async drop(): Promise<any> {}
}
