import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { swaggerConfig } from './utils/swagger-config';
import { ClusterService } from './config/cluster/cluster.service';

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        origin: '*',
        methods: '*',
        credentials: true
    });

    app.setBaseViewsDir(join(__dirname, '../views'));
    app.setViewEngine('ejs');
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

    swaggerConfig(app);

    ClusterService.clusterize(async () => {
        await app.listen(AppModule.port);
    });
};

bootstrap();
