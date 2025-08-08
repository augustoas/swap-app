import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../database/entities/user.entity';
import { Job } from '../database/entities/job.entity';
import * as path from 'path';

/**
 * Mail Service
 * 
 * Handles all email-related functionality including:
 * - Sending confirmation emails
 * - Sending password reset emails
 * - Managing an email queue to prevent rate limiting
 * 
 * Uses a queue system to manage email sending and prevent overwhelming
 * the email service provider with too many requests at once.
 */
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Queue to store emails waiting to be sent
   * Each item contains the email data and the method to use for sending
   */
  private emailQueue: any[] = [];
  
  /**
   * Flag to track if the queue is currently being processed
   */
  private isSending = false;
  private readonly headerAttachment = {
    filename: 'swap-icon.png',
    path: path.join(__dirname, 'templates', 'assets', 'swap-icon.png'),
    cid: 'headerImage'
  };

  /**
   * Adds signature and header attachments to the provided attachments array
   */
  private addAttachments(attachments: any[] = []): any[] {
    return [...attachments, this.headerAttachment];
  }
  
  /**
   * Adds an email to the sending queue and starts processing if needed
   * 
   * This method prevents direct sending of emails and instead queues them
   * for processing, which helps with rate limiting and error handling.
   * 
   * @param data - The email data (varies by email type)
   * @param method - String identifier for the email type to send
   */
  enqueueEmail(data: any, method: string) {
    // Add the email to the queue
    this.emailQueue.push({data, method});
    
    // Start processing the queue if it's not already being processed
    if (!this.isSending) {
      this.processEmailQueue();
    }
  }

  /**
   * Processes the email queue sequentially
   * 
   * This method:
   * 1. Sets the sending flag to true
   * 2. Processes each email in the queue one by one
   * 3. Calls the appropriate sending method based on the email type
   * 4. Sets the sending flag to false when complete
   * 
   * @returns A Promise that resolves when the queue is empty
   */
  private async processEmailQueue(): Promise<void> {
    this.isSending = true;
    
    // Process emails until the queue is empty
    while (this.emailQueue.length > 0) {
      // Get the next email from the queue
      const nextEmail = this.emailQueue.shift();
      const emailData = nextEmail.data;
      const method = nextEmail.method;
      
      // Send the email using the appropriate method
      try {
        switch (method) {
          case 'sendResetPassword':
            await this.sendResetPassword(emailData.email, emailData.token);
            break;
          case 'sendConfirmationEmail':
            await this.sendConfirmationEmail(emailData.user, emailData.token);
            break;
          case 'sendJobRatingEmail':
            await this.sendJobRatingEmail(emailData.email, emailData.name, emailData.jobId);
            break;
          case 'receivedOfferEmail':
            await this.receivedOfferEmail(emailData.user, emailData.job);
            break;
          case 'offerStatusEmail':
            await this.offerStatusEmail(emailData.user, emailData.job, emailData.type);
            break;
          default:
            console.error(`Unsupported email method: ${method}`);
        }
      } catch (error) {
        console.error(`Failed to send email (${method}):`, error);
        // Could implement retry logic here if needed
      }
    }
    
    // Mark as no longer sending
    this.isSending = false;
  }

  /**
   * Sends a password reset email
   * 
   * @param email - The recipient's email address
   * @param token - The password reset token
   */
  async sendResetPassword(email, token) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Request to reset your password.',
      template: './resetPassword', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        resetLink: `${process.env.BASE_FRONT_URL}${token}/recoverpassword`,
      },
    });
  }

  /**
   * Sends an email confirmation link to a newly registered user
   * 
   * This email contains a link that the user must click to verify
   * their email address and activate their account.
   * 
   * @param user - The user object containing email and name
   * @param token - The confirmation token to validate the email
   */
  async sendConfirmationEmail(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome! Please Confirm Your Email',
      template: './confirmationEmail',
      context: {
        // User's full name for personalization
        name: user.firstname + ' ' + user.lastname,
        // Full URL to the confirmation endpoint
        confirmationLink: `${process.env.BASE_FRONT_URL}/auth/confirmemail/${token}`,
      },
    });
  }

  async sendMail(to: string, subject: string, template: string, context: any) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendJobRatingEmail(email: string, name: string, jobId: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Califica tu experiencia',
      template: './jobRating',
      context: {
        name: name,
        jobId: jobId,
        url: `${process.env.BASE_FRONT_URL}/jobs/${jobId}/rate`,
      },
    });
  }

  async receivedOfferEmail(user: User, job: Job) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Has recibido una oferta para tu trabajo!',
      template: './receivedOffer',
      context: {
        name: user.firstname + ' ' + user.lastname,
        jobId: job.id,
        url: `${process.env.BASE_FRONT_URL}/jobs/${job.id}`,
      },
    });
  }

  async offerStatusEmail(user: User, job: Job, type: 'accepted' | 'rejected') {
    const accepted = type === 'accepted';
    await this.mailerService.sendMail({
      to: user.email,
      subject: type === 'accepted' ? '¡Tu oferta ha sido aceptada!' : 'Actualización de tu oferta',
      template: './offerStatus',
      context: {
        name: user.firstname + ' ' + user.lastname,
        job: job,
        accepted: accepted,
        url: `${process.env.BASE_FRONT_URL}/jobs/${job.id}`,
      },
    });
  }
}
