import { Request, Response, NextFunction } from 'express';
import { User, UserDocument } from "../models";
import { validatorRegisterInput } from "../utils/validator";
import HttpException from "../exceptions/HttpExceptions";
import { UNPROCESSABLE_ENTITY, UNAUTHORIZED} from 'http-status-codes';
import jwt from 'jsonwebtoken';

export interface UserPayload {
    id: string
}
export const register = async (req: Request, res: Response, next: NextFunction) => {
    let { username, password, confirmPassword, email } = req.body;
    try {
        let { valid, errors} = validatorRegisterInput(username, password, confirmPassword, email);
        if(!valid) {
            throw new HttpException(UNPROCESSABLE_ENTITY, '用户提交的数据不正确', errors);
        }
        let oldUser: (UserDocument | null) = await User.findOne({username});
        if(oldUser) {
            throw new HttpException(UNPROCESSABLE_ENTITY, '用户名存在', errors)
        }
        let user: UserDocument =  new User({username, password, confirmPassword, email});
        await user.save();
        res.json({
            success: true,
            data: user
        })
    }catch(error) {
        next(error)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { username, password } = req.body;
        let user : UserDocument | null = await User.login(username, password);
        if (user) {
            let access_token = user.getAccessToken();
            res.json({
                success: true,
                data: access_token 
            })
        } else {
            throw new HttpException(UNAUTHORIZED, '登录失败')
        }
    } catch(error) {
        console.log('error', error);
        next(error)
    }
}


//客户端会把token放在请求头里发给服务器
export const validate = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (authorization) {
        const access_token = authorization;//Bearer access_token
        if (access_token) {
            try {
                const userPayload: UserPayload = jwt.verify(access_token, process.env.JWT_SECRET_KEY || 'jinxin') as UserPayload;
                const user: UserDocument | null = await User.findById(userPayload.id);
                if (user) {
                    res.json({
                        success: true,
                        data: user.toJSON()
                    })
                } else {
                    next(new HttpException(UNAUTHORIZED, '用户未找到'));
                }
            } catch (error) {
                next(new HttpException(UNAUTHORIZED, 'access_token不正确'));
            }
        } else {
            next(new HttpException(UNAUTHORIZED, 'access_token未提供'));
        }
    } else {
        next(new HttpException(UNAUTHORIZED, 'authorization未提供'));
    }
}


export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { userId } = req.body;
        //http://localhost/uploads/157000000.jpg
        let avatar = `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}`;
        await User.updateOne({ _id: userId }, { avatar });
        //处理上传的文件，然后更新数据库，更新此用户对应的avatar字段。然后返回真实的图片路径
        res.json({
            success: true,
            data: avatar
        });
    } catch (error) {
        next(error);
    }
}