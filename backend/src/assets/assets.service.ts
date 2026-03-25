import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as path from 'path';

@Injectable()
export class AssetsService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File) {
    const ext = path.extname(file.originalname);
    const key = `uploads/${crypto.randomUUID()}${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl = this.configService.get('AWS_S3_PUBLIC_URL');
    const url = publicUrl
      ? `${publicUrl}/${key}`
      : `https://${this.bucket}.s3.amazonaws.com/${key}`;

    return {
      res: { url, key },
      code: 0,
      message: 'Archivo subido correctamente',
    };
  }
}
