import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Response } from 'express'
import { StandarResponse } from '../interfaces/standar-response.interface'

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandarResponse>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandarResponse> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse<Response>()

    return next.handle().pipe(
      map((data) => {
        return {
          data: data,
          message: null,
          error: null,
          statusCode: response.statusCode,
        }
      }),
    )
  }
}
