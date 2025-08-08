import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Seeder, DataFactory } from 'nestjs-seeder';

@Injectable()
export class CategorySeeder implements Seeder {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed(): Promise<any> {
    const categories = DataFactory.createForClass(Category).generate(10);
    for (const index in categories) {
      const newCategory = this.categoryRepository.create(categories[index]);
      await this.categoryRepository.save(newCategory);
    }
  }

  async drop(): Promise<any> {}
}
