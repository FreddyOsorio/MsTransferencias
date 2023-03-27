import { Controller, Get, Query, Post, Req} from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query('userId') userId: string) {
    //return this.appService.getHello();
    return { name: 'Uchechukwu Azubuko', country: 'Nigeria' , id: userId};
  }

  @Post()
  store(@Req() req: Request) {
    console.log('body' , req.body)
    return req.body;
  }
}
