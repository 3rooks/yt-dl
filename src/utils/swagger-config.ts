import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerConfig = (app: NestExpressApplication) => {
    const config = new DocumentBuilder()
        .setTitle('YT-DL')
        .setDescription('API-REST endpoints')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
};
