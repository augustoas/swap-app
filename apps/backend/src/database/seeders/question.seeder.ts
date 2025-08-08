import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Job } from '../entities/job.entity';
import { Question } from '../entities/question.entity';
import { Seeder } from 'nestjs-seeder';

@Injectable()
export class QuestionSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
  ) {}

  async seed(): Promise<any> {
    // Find swap and userx users
    const swapUser = await this.userRepository.findOne({
      where: { email: 'swap@swap.cl' }
    });
    const userX = await this.userRepository.findOne({
      where: { email: 'userx@userx.cl' }
    });

    // Get last 4 jobs
    const jobs = await this.jobRepository.find({
      take: 4,
      order: { id: 'DESC' }
    });

    // Create questions for each job from both users
    for (const job of jobs) {
      // Create 2 questions from swap user
      const swapQuestions = [
        `¿Cuál es el plazo máximo para completar el trabajo #${job.id}?`,
        `¿Se requiere experiencia específica para el trabajo #${job.id}?`
      ];

      for (const questionText of swapQuestions) {
        const question = this.questionRepository.create({
          text: questionText,
          user: swapUser,
          job: job
        });
        await this.questionRepository.save(question);
      }

      // Create 2 questions from userX
      const userXQuestions = [
        `¿Es posible realizar el trabajo #${job.id} de forma remota?`,
        `¿Hay flexibilidad en el presupuesto del trabajo #${job.id}?`
      ];

      for (const questionText of userXQuestions) {
        const question = this.questionRepository.create({
          text: questionText,
          user: userX,
          job: job
        });
        await this.questionRepository.save(question);
      }
    }
  }

  async drop(): Promise<any> {}
}
