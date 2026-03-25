import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailRequestDto } from './dto/mail.req.dto';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('MAIL_SERVICE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(dto: SendMailRequestDto) {
    const info = await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
    });

    return {
      res: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
      code: 0,
      message: 'Correo enviado correctamente',
    };
  }
}
