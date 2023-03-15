import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Info } from 'src/modules/info/schema/info.schema';
import { v4 as uuidv4 } from 'uuid';

export type SearchDocument = HydratedDocument<Search>;

@Schema({
    _id: false,
    timestamps: true,
    versionKey: false
})
export class Search {
    @Prop({ unique: true, default: () => uuidv4() })
    _id?: string;

    @Prop({ required: true, unique: true })
    vidId: string;

    @Prop({
        ref: Info.name,
        required: true
    })
    info: string;
}

export const SearchSchema = SchemaFactory.createForClass(Search);
