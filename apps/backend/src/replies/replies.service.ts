import { Injectable } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Job } from '../database/entities/job.entity';
import { Question } from '../database/entities/question.entity';
import { Offer } from '../database/entities/offer.entity';
import { Reply } from '../database/entities/reply.entity';
import { NotificationWebSocketService } from '../websocket/services/notification-websocket.service';
import { JobsService } from '../jobs/jobs.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class RepliesService {
  constructor(
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
    private readonly notificationWebSocketService: NotificationWebSocketService,
    private readonly jobsService: JobsService,
    private readonly questionsService: QuestionsService,
  ) {}

  async create(createReplyDto: CreateReplyDto, user: User): Promise<Reply> {
    const { questionId, ...replyDto } = createReplyDto;
    const newReply = this.replyRepository.create(replyDto);
    newReply.user = { id: +user.id } as User;
    if (questionId) newReply.question = { id: +questionId } as Question;

    const question = await this.questionsService.findOne(+questionId);
    const job = await this.jobsService.findOne(question.job.id);
    const savedReply = await this.replyRepository.save(newReply);

    // Send notification to the person who created the reply
    this.notificationWebSocketService.sendNotificationToUser(
      user.id,
      'Respuesta enviada con éxito',
      'Has respondido la pregunta. El que preguntó podrá leer tu respuesta pronto. Mantente atento a su reacción o cualquier nueva interacción.',
      'reply',
      `/jobs/${job.id}`
    );

    // Send notification to the question creator about the new reply
    this.notificationWebSocketService.sendNotificationToUser(
      question.user.id,
      'Tu pregunta ha recibido una respuesta',
      'Has recibido una respuesta a tu pregunta. Revisa los detalles y, si lo deseas, interactúa nuevamente con quien respondió.',
      'reply',
      `/jobs/${job.id}`
    );

    return savedReply;
  }

  async findAll(): Promise<Array<Reply>> {
    return this.replyRepository.find();
  }

  async findOne(id: number): Promise<Reply> {
    return this.replyRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateReplyDto: UpdateReplyDto): Promise<Reply> {
    const thisReply = await this.replyRepository.findOne({ where: { id: id } });
    if (updateReplyDto.questionId)
      thisReply.question = { id: +updateReplyDto.questionId } as Question;
    await this.replyRepository.update(id, thisReply);
    return this.replyRepository.findOne({ where: { id: id } });
  }

  async remove(id: number): Promise<void> {
    await this.replyRepository.delete(id);
  }
}
