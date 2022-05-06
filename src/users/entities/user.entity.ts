import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as Mongoose from 'mongoose';
import { Exclude } from 'class-transformer';

@Schema()
export class User extends Mongoose.Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop()
  surname: string;

  @Exclude()
  @Prop()
  refresh_token?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
