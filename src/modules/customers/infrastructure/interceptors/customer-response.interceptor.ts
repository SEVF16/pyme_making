import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CustomerResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Agregar información adicional a las respuestas
        if (Array.isArray(data)) {
          return {
            data,
            total: data.length,
            timestamp: new Date().toISOString(),
          };
        }

        if (data && typeof data === 'object') {
          return {
            ...data,
            timestamp: new Date().toISOString(),
          };
        }

        return data;
      }),
    );
  }
}