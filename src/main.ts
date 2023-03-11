import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CONFIG } from './constants/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix(CONFIG.PREFIX);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true
            }
        })
    );
    const config = new DocumentBuilder()
        .setTitle('YT-DL')
        .setDescription('API-REST endpoints')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    await app.listen(AppModule.port);
}
bootstrap();
