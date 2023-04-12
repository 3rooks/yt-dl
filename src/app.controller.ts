import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get('/')
    @Render('index')
    root() {}

    @Get('/channel')
    @Render('pages/channel')
    subroot() {}

    @Get('/image')
    @Render('pages/image')
    subsubroot() {}
}
