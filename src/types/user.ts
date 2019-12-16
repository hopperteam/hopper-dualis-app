import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    username: string;
    password: string;
    subscription: string;
    grades: any;
}

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    password: { type: String, required: true },
    subscription: { type: String },
    grades: { type: Object }
}, {
    versionKey: false // set to true to keep track of version of document
});

UserSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.subscription;
        delete ret.grades;
    }
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
