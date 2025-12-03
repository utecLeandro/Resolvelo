import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

export function serializeBigInt(v: any): any {
  if (v === null || v === undefined) return v;
  
  if (typeof v === 'bigint') return v.toString();
  
  if (v instanceof Date) return v.toISOString();
  
  if (v instanceof Prisma.Decimal) return v.toString();
  
  if (Array.isArray(v)) {
    return v.map((item) => serializeBigInt(item));
  }
  
  if (typeof v === 'object') {
    // Evitar serializar objetos especiales de NestJS o Node que no sean datos planos si es posible,
    // pero para seguridad serializamos recursivamente todo objeto plano.
    const out: any = {};
    for (const k of Object.keys(v)) {
      out[k] = serializeBigInt(v[k]);
    }
    return out;
  }
  
  return v;
}

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => serializeBigInt(data)));
  }
}
