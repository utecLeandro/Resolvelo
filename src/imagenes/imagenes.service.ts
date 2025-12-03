import { Injectable, BadRequestException } from '@nestjs/common';
import {
  PresignRequestDto,
  PresignResponse,
  PresignUploadUrl,
} from './dto/presign.dto';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ImagenesService {
  async generarPresignUrls(
    payload: PresignRequestDto,
  ): Promise<PresignResponse> {
    const bucket =
      process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET || '';
    const region = process.env.AWS_REGION || process.env.S3_REGION || '';
    if (!bucket || !region) {
      throw new BadRequestException(
        'Variables AWS_S3_BUCKET_NAME y AWS_REGION requeridas',
      );
    }
    const s3 = new S3Client({ region });
    const expiresInSec = 15 * 60;
    const uploads: PresignUploadUrl[] = [];
    try {
      for (const f of payload.files) {
        const ext = this.extensionFromContentType(f.contentType);
        const key = `publicaciones/${payload.publicacionId}/${randomUUID()}.${ext}`;
        const expiresAt = new Date(
          Date.now() + expiresInSec * 1000,
        ).toISOString();
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: f.contentType,
        });
        const url = await getSignedUrl(s3, command, {
          expiresIn: expiresInSec,
        });
        uploads.push({
          key,
          url,
          method: 'PUT',
          expiresAt,
          contentType: f.contentType,
        });
      }
    } catch (error: any) {
      console.error('Error generando presigned URLs S3:', error);
      throw new BadRequestException(
        'Error generando URLs de subida: ' + (error.message || error),
      );
    }

    return { uploads };
  }

  private extensionFromContentType(ct: string): string {
    if (ct === 'image/jpeg') return 'jpg';
    if (ct === 'image/png') return 'png';
    if (ct === 'image/webp') return 'webp';
    return 'bin';
  }
}
