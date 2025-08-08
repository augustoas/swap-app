import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Job } from '../database/entities/job.entity';
import { Question } from '../database/entities/question.entity';
import { NotificationWebSocketService } from '../websocket/services/notification-websocket.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly notificationWebSocketService: NotificationWebSocketService,
    private readonly jobsService: JobsService,
  ) {}

  async create(
    createQuestionDto: CreateQuestionDto,
    user: User,
  ): Promise<Question> {
    const { jobId, ...questionDto } = createQuestionDto;
    const newQuestion = this.questionRepository.create(questionDto);
    newQuestion.user = { id: +user.id } as User;
    newQuestion.job = { id: +jobId } as Job;

    const job = await this.jobsService.findOne(+jobId);
    const savedQuestion = await this.questionRepository.save(newQuestion);

    // Send notification to the person who created the question
    this.notificationWebSocketService.sendNotificationToUser(
      user.id,
      'Pregunta enviada con éxito',
      'Tu pregunta ha sido enviada. El receptor la verá pronto y podrá responderte. Mantente atento a su respuesta.',
      'question',
      `/jobs/${jobId}`
    );

    // Send notification to the job creator about the new question
    this.notificationWebSocketService.sendNotificationToUser(
      job.jobCreator.id,
      'Haz recibido una nueva pregunta',
      'Has recibido una nueva pregunta. Revisa los detalles y responde cuando estés listo. La persona que pregunta está esperando tu respuesta.',
      'question',
      `/jobs/${jobId}`
    );

    return savedQuestion;
  }

  async findAll(): Promise<Array<Question>> {
    return this.questionRepository.find();
  }

  async findOne(id: number): Promise<Question> {
    return this.questionRepository.findOne({ 
      relations: ['user', 'job'],
      where: { id: id } 
    });
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const thisQuestion = await this.questionRepository.findOne({
      where: { id: id },
    });
    if (updateQuestionDto.jobId)
      thisQuestion.job = { id: +updateQuestionDto.jobId } as Job;
    await this.questionRepository.update(id, thisQuestion);
    return this.questionRepository.findOne({ where: { id: id } });
  }

  async remove(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }
}
