import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTycDto } from './dto/create-tyc.dto';
import { UpdateTycDto } from './dto/update-tyc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsAndConditions } from '../database/entities/termsAndConditions.entity';

@Injectable()
export class TycService {
  constructor(
    @InjectRepository(TermsAndConditions)
    private readonly tycRepository: Repository<TermsAndConditions>,
  ) {}

  async create(createTycDto: CreateTycDto): Promise<TermsAndConditions> {
    const newTyc = this.tycRepository.create(createTycDto);
    return this.tycRepository.save(newTyc);
  }

  async findAll(): Promise<Array<TermsAndConditions>> {
    return this.tycRepository.find();
  }

  async findOne(id: number): Promise<TermsAndConditions> {
    const tyc = await this.tycRepository.findOne({ where: { id: id } });
    if (!tyc) {
      throw new NotFoundException(`Terms and conditions with ID ${id} not found`);
    }
    return tyc;
  }

  async update(id: number, updateTycDto: UpdateTycDto): Promise<TermsAndConditions> {
    const updateResult = await this.tycRepository.update(id, updateTycDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Terms and conditions with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.tycRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Terms and conditions with ID ${id} not found`);
    }
  }
}
