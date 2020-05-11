import mongoose, { Schema, Model, Document, HookNextFunction} from 'mongoose';
import validator from 'validator';
import bcrypthjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface UserDocument extends Document {
    username: string;
    password: string;
    email: string;
    avatar: string;
    getAccessToken: () => string;
    _doc:UserDocument;
}
const UserSchema = new Schema<UserDocument>({
    username: {
        type: String,
        required: [true,'用户名不能为空'],
        minlength: [6, '最小长度不能小于6位'],
        maxlength: [12, '最长长度不能大于12位']
    },
    password: String,
    avator: String,
    email: {
        type: String,
        validate: {
            validator: validator.isEmail
        },
        trim: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc: any, result: any) {
            result.id = result._id;
            delete result._id;
            delete result.__v;
            delete result.password;
            delete result.createAt;
            delete result.updateAt;
            return result;
        }
    }
})  // 使用时间戳 会自动添加两个字段 createAt updateAt

// 在每次保存文档之前执行什么操作
UserSchema.pre<UserDocument>('save', async function(next: HookNextFunction) {
    if(!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await bcrypthjs.hash(this.password, 10);
        next()
    } catch(error) {
        next(error)
    }
})

// 给 User这个模型，扩展一个login方法
UserSchema.static('login', async function (this: any, username: string, password: string) : Promise<UserDocument | null> {
    let user: UserDocument | null = await this.model('User').findOne({ username });

    if(user) {
        // 判断用户输入的密码和数据库里存的密码是否匹配
        const matched = await bcrypthjs.compare(password, user.password);
        if(matched) {
            return user;
        } else {
            return null
        }
    } else {
        return null;
    }
})

UserSchema.methods.getAccessToken =  function(this: UserDocument) : string {
    let payload:{id: string} = {id: this._id};
    return jwt.sign(payload, process.env.JWT_SECRET_KEY || 'jinxin', { expiresIn: "1h"})
}

interface UserModel<T extends Document> extends Model<T> {
    login: (username: string, password: string) => UserDocument | null
}

export const User: UserModel<UserDocument> = mongoose.model<UserDocument, UserModel<UserDocument>>('User', UserSchema);