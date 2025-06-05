import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpRequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger();

  /**
   * Express middleware to log the request
   *
   * @param req
   * @param res
   * @param next
   */
  public use(req: Request, res: Response, next: NextFunction) {
    const startTimeMs = Date.now();
    res.on('close', () => {
      this.logger.log(this.getCombinedLog(req, res, Date.now() - startTimeMs));
    });
    next();
  }

  /**
   * @param req express request
   * @param res express response
   * @returns the log string
   */
  protected getCombinedLog(
    req: Request,
    res: Response,
    executionTimeMs: number,
  ): string {
    const contentType = res.getHeader('content-type');
    const contentLength = res.getHeader('content-length');
    const contentInfo = `${`${contentType ? contentType.toString() : '-'};`.split(';')[0]}:${contentLength ? contentLength.toString().padStart(3, ' ') : '-'}`;
    const execTime = executionTimeMs
      ? `[${('       ' + executionTimeMs).slice(-8)}] `
      : '';
    return `${req.ip} ${req.method} ${req.originalUrl} ${`${req.protocol}`.toUpperCase()}/${
      req.httpVersion
    } ${res.statusCode} ${execTime} ${contentInfo} "${req.headers.referer ? req.headers.referer : '-'}"`;
  }
}
