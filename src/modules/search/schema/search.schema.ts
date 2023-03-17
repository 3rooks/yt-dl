import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Info } from 'src/modules/info/schema/info.schema';
import * as uuid from 'uuid-random';

export type SearchDocument = HydratedDocument<Search>;

@Schema({
    _id: false,
    timestamps: true,
    versionKey: false
})
export class Search {
    @Prop({ unique: true, default: () => uuid() })
    _id?: string;

    @Prop({ required: true, unique: true })
    id: string;

    @Prop({
        type: Object,
        ref: Info.name,
        required: true
    })
    info: string | Info;
}

export const SearchSchema = SchemaFactory.createForClass(Search);
