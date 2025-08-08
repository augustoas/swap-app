import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Offer } from '../database/entities/offer.entity';
import { Job } from '../database/entities/job.entity';
import { NotificationWebSocketService } from '../websocket/services/notification-websocket.service';
import { JobsService } from '../jobs/jobs.service';
import { ChatRoomService } from '../chat-room/chat-room.service';
import { MailService } from '../mail/mail.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Offer_Status, Job_Status } from '../types/Status.enum';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly notificationWebSocketService: NotificationWebSocketService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
    private readonly chatRoomService: ChatRoomService,
    private readonly mailService: MailService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const { jobId, ...offerDto } = createOfferDto;
    const newOffer = this.offerRepository.create(offerDto);
    newOffer.user = { id: +user.id } as User;
    newOffer.job = { id: +jobId } as Job;
    const job = await this.jobsService.findOne(jobId);
    if (job.status !== Job_Status.PUBLISHED) throw new BadRequestException('This job is not published');
    if (job.jobCreator.id === user.id) throw new BadRequestException('You cannot offer to your own job');
    if (job.jobWorker !== null) throw new BadRequestException('This job already has a worker');

    // Send notification to the person who created the offer
    this.notificationWebSocketService.sendOfferNotification(
      user.id,
      'Oferta enviada con éxito',
      '¡Has enviado tu oferta para el trabajo! El empleador la revisará pronto. Una vez que tomen una decisión, recibirás una notificación con la respuesta, ya sea aceptada o rechazada.',
      jobId,
      newOffer.id,
      'offer_received'
    );

    // Send notification to the job creator about the new offer
    this.notificationWebSocketService.sendOfferNotification(
      job.jobCreator.id,
      'Nueva oferta recibida',
      'Has recibido una nueva oferta para tu publicación de trabajo. Revisa los detalles y decide si aceptas o rechazas la propuesta. El ofertante está esperando tu decisión.',
      jobId,
      newOffer.id,
      'offer_received'
    );

    this.mailService.enqueueEmail(
      {user: user, job: job}, 
      'receivedOfferEmail'
    );
    
    const savedOffer = await this.offerRepository.save(newOffer);
    return savedOffer;
  }

  async findAll(): Promise<Array<Offer>> {
    return this.offerRepository.find();
  }

  async findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOne({ where: { id: id } });
  }

  async findOffersByUserId(userId: number) {
    return this.offerRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'job'],
      order: { createdDate: 'DESC' },
    });
  }

  async update(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    const thisOffer = await this.offerRepository.findOne({ where: { id: id } });
    if (updateOfferDto.jobId)
      thisOffer.job = { id: +updateOfferDto.jobId } as Job;
    await this.offerRepository.update(id, thisOffer);
    return this.offerRepository.findOne({ where: { id: id } });
  }

  async findOffersByJobId(jobId: number): Promise<Array<Offer>> {
    return this.offerRepository.find({ where: { job: { id: jobId } } });
  }

  async remove(id: number): Promise<void> {
    await this.offerRepository.delete(id);
  }

  async acceptOffer(offerId: number, user: User): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['job', 'job.jobCreator', 'user'],
    });
    if (!offer) throw new BadRequestException('Offer not found');
    if (offer.job.jobCreator.id !== user.id) throw new UnauthorizedException('Only the job creator can accept offers');
    if (offer.status !== Offer_Status.PENDING) throw new BadRequestException('This offer cannot be accepted');

    // Start a transaction to ensure all operations are atomic
    const result = await this.offerRepository.manager.transaction(async (manager) => {
      // Update the accepted offer
      offer.status = Offer_Status.ACCEPTED;
      await manager.save(offer);

      // Update the job status
      offer.job.status = Job_Status.CONFIRMED;
      offer.job.jobWorker = offer.user;
      await manager.save(offer.job);

      // Update all other pending offers to cancelled
      await manager
        .createQueryBuilder()
        .update(Offer)
        .set({ status: Offer_Status.CANCELLED })
        .where('job.id = :jobId', { jobId: offer.job.id })
        .andWhere('id != :offerId', { offerId: offer.id })
        .andWhere('status = :status', { status: Offer_Status.PENDING })
        .execute();

      // Send email to the worker
      this.mailService.enqueueEmail(
        {
          user: offer.user,
          job: offer.job,
          type: 'accepted',
        },
        'offerStatusEmail'
      );

      // Send email to the creator
      this.mailService.enqueueEmail(
        {
          user: offer.job.jobCreator,
          job: offer.job,
          type: 'accepted',
        },
        'offerStatusEmail'
      );

      return offer;
    });

    // Create chat room after successful offer acceptance
    try {
      const chatRoom = await this.chatRoomService.create({
        jobId: offer.job.id.toString(),
        jobCreatorId: offer.job.jobCreator.id.toString(),
        jobWorkerId: offer.user.id.toString(),
        isActive: true,
      });

      // Send notifications about chat room creation
      this.notificationWebSocketService.sendChatNotification(
        offer.user.id,
        offer.job.jobCreator.firstname,
        chatRoom.id,
        offer.job.description
      );

      this.notificationWebSocketService.sendChatNotification(
        offer.job.jobCreator.id,
        offer.user.firstname,
        chatRoom.id,
        offer.job.description
      );

      console.log(`Chat room created for job ${offer.job.id}: ${chatRoom.id}`);
    } catch (error) {
      console.error(`Failed to create chat room for job ${offer.job.id}:`, error.message);
      // Don't fail the offer acceptance if chat room creation fails
    }

    // Send real-time notifications after the transaction
    // Notify the worker that their offer was accepted
    this.notificationWebSocketService.sendOfferNotification(
      offer.user.id,
      'Oferta Aceptada',
      '¡Felicidades! Tu oferta ha sido aceptada. Puedes comenzar a trabajar en el proyecto.',
      offer.job.id,
      offer.id,
      'offer_accepted'
    );

    // Notify the job creator about the acceptance
    this.notificationWebSocketService.sendOfferNotification(
      offer.job.jobCreator.id,
      'Oferta Aceptada',
      'Has aceptado una oferta. El trabajo ahora está confirmado.',
      offer.job.id,
      offer.id,
      'offer_accepted'
    );

    return result;
  }

  async declineOffer(offerId: number, user: User): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['job', 'job.jobCreator', 'user'],
    });

    if (!offer) throw new BadRequestException('Offer not found');
    if (offer.job.jobCreator.id !== user.id) throw new UnauthorizedException('Only the job creator can decline offers');
    if (offer.status !== Offer_Status.PENDING) throw new BadRequestException('This offer cannot be declined');

    // Update offer status
    offer.status = Offer_Status.REJECTED;
    const savedOffer = await this.offerRepository.save(offer);

    // Send email to the worker
    this.mailService.enqueueEmail(
      {
        user: offer.user,
        job: offer.job,
        type: 'rejected',
      },
      'offerStatusEmail'
    );

    // Send email to the creator
    this.mailService.enqueueEmail(
      {
        user: offer.job.jobCreator,
        job: offer.job,
        type: 'rejected',
      },
      'offerStatusEmail'
    );

    // Send real-time notifications
    // Notify the worker that their offer was rejected
    this.notificationWebSocketService.sendOfferNotification(
      offer.user.id,
      'Oferta Rechazada',
      'Tu oferta ha sido rechazada. Puedes aplicar a otros trabajos.',
      offer.job.id,
      offer.id,
      'offer_rejected'
    );

    // Notify the job creator about the rejection
    this.notificationWebSocketService.sendOfferNotification(
      offer.job.jobCreator.id,
      'Oferta Rechazada',
      'Has rechazado una oferta.',
      offer.job.id,
      offer.id,
      'offer_rejected'
    );

    return savedOffer;
  }
}
