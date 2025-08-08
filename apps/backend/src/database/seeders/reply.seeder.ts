import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Question } from '../entities/question.entity';
import { Reply } from '../entities/reply.entity';
import { Seeder } from 'nestjs-seeder';

@Injectable()
export class ReplySeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    @InjectRepository(Reply) private readonly replyRepository: Repository<Reply>,
  ) {}

  async seed(): Promise<any> {
    // Find admin and swap users
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@admin.cl' }
    });
    const swapUser = await this.userRepository.findOne({
      where: { email: 'swap@swap.cl' }
    });

    // Get questions for the last 2 jobs
    const questions = await this.questionRepository.find({
      relations: ['job'],
      order: { job: { id: 'DESC' } },
      take: 8 // 4 questions per job * 2 jobs
    });

    // Create replies for each question
    for (const question of questions) {
      // Admin's reply to the question
      const adminReply = this.replyRepository.create({
        text: `Respuesta del administrador a la pregunta: "${question.text}"`,
        user: adminUser,
        question: question
      });
      await this.replyRepository.save(adminReply);

      // Swap's reply to admin's reply
      const swapReply = this.replyRepository.create({
        text: `Gracias por la aclaración sobre: "${question.text}"`,
        user: swapUser,
        question: question
      });
      await this.replyRepository.save(swapReply);
    }
  }

  async drop(): Promise<any> {}
}
