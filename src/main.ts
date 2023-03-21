import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClusterService } from './config/cluster/cluster.service';
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

    ClusterService.clusterize(async () => {
        await app.listen(AppModule.port);
    });
}
bootstrap();
