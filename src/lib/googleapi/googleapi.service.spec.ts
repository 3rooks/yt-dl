import { Test, TestingModule } from '@nestjs/testing';
import { GoogleapiService } from './googleapi.service';

describe('GoogleapiService', () => {
    let service: GoogleapiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GoogleapiService]
        }).compile();

        service = module.get<GoogleapiService>(GoogleapiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
