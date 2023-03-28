import { WriteStream } from 'fs';
import { Readable } from 'stream';

export interface IDownloadVideo {
    audioReadable: Readable;
    audioWriteable: WriteStream;
    videoReadable: Readable;
    videoWriteable: WriteStream;
}
