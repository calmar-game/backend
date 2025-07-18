import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('proxy')
export class ProxyController {
  @All('/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      // Получаем целевой URL из query параметра
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Копируем заголовки из оригинального запроса
      const headers = new Headers(req.headers as HeadersInit);
      // Удаляем заголовки, которые могут вызвать проблемы
      headers.delete('host');
      headers.delete('content-length');
      headers.set('Origin', 'https://quote-api.jup.ag');

      // Создаем параметры запроса
      const fetchOptions: RequestInit = {
        method: req.method,
        headers: headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
      };

      // Формируем URL с query параметрами
      const urlParams = new URLSearchParams(req.query as Record<string, string>);
      urlParams.delete('url'); // Удаляем параметр url из query
      const finalUrl = `${targetUrl}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;

      // Выполняем запрос
      const response = await fetch(finalUrl, fetchOptions);
      
      // Копируем статус
      res.status(response.status);

      // Копируем заголовки
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Отправляем тело ответа
      const data = await response.text();
      return res.send(data);

    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(500).json({
        error: 'Proxy request failed',
        details: error.message
      });
    }
  }
}