class HttpException extends Error {
    // status HTTP 错误状态码 message是错误提示信息 errors是错误对象
    constructor(public status:number, public message:string, public errors ?:any = {}) {
        super(message);
    }
}

export default HttpException;