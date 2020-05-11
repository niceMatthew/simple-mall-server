import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import "dotenv/config";
import multer from 'multer';
import path from 'path';
import errorMiddleware from './middlewares/errorMIddleware';
import HttpException from './exceptions/HttpExceptions';
import * as  userController from './controllers/user';
import * as sliderController from './controllers/slider';
import * as lessonController from './controllers/lesson';
import { Slider, Lesson } from './models';

const app: Express = express();
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true})); 

app.get('/', (_req, res, _next) => {
    res.json({ success: true, data: 'hello world' })
});

app.post('/user/register', userController.register);
app.post('/user/login', userController.login);

const storage = multer.diskStorage({
    //指定上传的目录
    destination: path.join(__dirname, 'public', 'uploads'),
    filename(_req: Request, file: Express.Multer.File, callback) {
        // callback 第二个参数是文件名 时间戳.jpg
        callback(null, Date.now() + path.extname(file.originalname));
    }
}); 

const upload = multer({ storage });
app.post('/user/uploadAvatar', upload.single('avatar'), userController.uploadAvatar);

//客户端把token传给服务器，服务器返回当前的用户。如果token不合法或过期了，则会返null
app.get('/user/validate', userController.validate);

app.get('/slider/list', sliderController.list);
app.get('/lesson/list', lessonController.list);
app.get('/lesson/:id', lessonController.getLesson);

// 如果没有匹配到任何路由，则会创造一个自定义404对象并传递给错误中间件
app.use((_req: Request, _res: Response, next: NextFunction) => {
    const error = new HttpException(404, '尚未为此路径分配路由');
    next(error);
})

app.use(errorMiddleware);



(async function(){
    await mongoose.set('useNewUrlParser', true);
    await mongoose.set('useUnifiedTopology', true);
    const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost/practice";
    await mongoose.connect(MONGODB_URL);
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
        console.log(`Running on http://localhost:${PORT}`)
    })
})()



// async function createInitialSliders() {
//     const sliders = await Slider.find();
//     if (sliders.length == 0) {
//         const sliders = [
//             { url: 'https://yanxuan.nosdn.127.net/f129bf4309cbe8878f39982203214629.jpg?type=webp&imageView&quality=75&thumbnail=750x0' },
//             { url: 'https://yanxuan.nosdn.127.net/a16ac18c02bb26755dbcac1911631aa0.jpg?type=webp&imageView&quality=75&thumbnail=750x0' },
//             { url: 'https://yanxuan.nosdn.127.net/84d82137e854e58bf26791db3ba203b8.jpg?type=webp&imageView&quality=75&thumbnail=750x0' },
//             { url: 'https://yanxuan.nosdn.127.net/ee856ce5b451dbdeab78abffce195957.jpg?type=webp&imageView&quality=75&thumbnail=750x0' },
//             { url: 'https://yanxuan.nosdn.127.net/84d82137e854e58bf26791db3ba203b8.jpg?type=webp&imageView&quality=75&thumbnail=750x0' }
//         ];
//         await Slider.create(sliders);
//     }
// }

// async function createInitialLessons() {
//     const lessons = await Lesson.find();
//     if (lessons.length == 0) {
//         const lessons = [
//             {
//                 order: 1,
//                 title: '1.严选',
//                 url: 'https://yanxuan.nosdn.127.net/efe5bb71fd6787d9c5f5b051eb607666.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             },
//             {
//                 order: 2,
//                 title: '2.严选',
//                 url: 'https://yanxuan.nosdn.127.net/efe5bb71fd6787d9c5f5b051eb607666.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             },
//             {
//                 order: 3,
//                 title: '3.严选',
//                 url: 'http://yanxuan-miaobi.nos-jd.163yun.com/1110003_1_6_wap_8ea5e7eaa3c340d56c18f6400bfe5404.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             },
//             {
//                 order: 4,
//                 title: '4.严选',
//                 url: 'http://yanxuan-miaobi.nos-jd.163yun.com/1110003_1_6_wap_8ea5e7eaa3c340d56c18f6400bfe5404.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             },
//             {
//                 order: 5,
//                 title: '5.严选',
//                 url: 'http://yanxuan-miaobi.nos-jd.163yun.com/1110003_1_6_wap_8ea5e7eaa3c340d56c18f6400bfe5404.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             },
//             {
//                 order: 6,
//                 title: '6.严选',
//                 url: 'http://yanxuan-miaobi.nos-jd.163yun.com/1110003_1_6_wap_8ea5e7eaa3c340d56c18f6400bfe5404.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             },
//             {
//                 order: 7,
//                 title: '7.严选',
//                 url: 'http://yanxuan-miaobi.nos-jd.163yun.com/1110003_1_6_wap_8ea5e7eaa3c340d56c18f6400bfe5404.jpg?type=webp&imageView&quality=75&thumbnail=750x0',
//                 price: 100.00,
//                 category: 'product'
//             }

//         ];
//         await Lesson.create(lessons);
//     }
// }