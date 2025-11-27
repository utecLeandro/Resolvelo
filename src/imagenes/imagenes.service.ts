import { Injectable, BadRequestException, NotImplementedException } from '@nestjs/common'
import { PresignRequestDto, PresignResponse, PresignUploadUrl } from './dto/presign.dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ImagenesService {
  async generarPresignUrls(payload: PresignRequestDto): Promise<PresignResponse> {
    const s3Enabled = String(process.env.S3_ENABLED || '').toLowerCase() === 'true'
    if (!s3Enabled) {
      throw new NotImplementedException('S3 no configurado')
    }

    const bucket = process.env.S3_BUCKET || ''
    const region = process.env.S3_REGION || ''
    if (!bucket || !region) {
      throw new BadRequestException('Variables S3_BUCKET y S3_REGION requeridas')
    }

    const uploads: PresignUploadUrl[] = payload.files.map((f) => {
      const ext = this.extensionFromContentType(f.contentType)
      const key = `publicaciones/${payload.publicacionId}/${uuidv4()}.${ext}`
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
      return { key, url, method: 'PUT', expiresAt, contentType: f.contentType }
    })

    return { uploads }
  }

  private extensionFromContentType(ct: string): string {
    if (ct === 'image/jpeg') return 'jpg'
    if (ct === 'image/png') return 'png'
    if (ct === 'image/webp') return 'webp'
    return 'bin'
  }
}

