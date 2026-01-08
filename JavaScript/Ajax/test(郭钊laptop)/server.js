//1. 引入express
const express = require('express');

//2. 创建应用对象
const app = express();

// 3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装

app.all('/server', (req, res) => {
    // 设置响应头，允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 设置响应头，允许携带凭证
    res.setHeader('Access-Control-Allow-Headers', '*');
    // 设置响应体
    res.send('Hello World! all-server');
});
// 延时响应
app.all('/server-delay', (req, res) => {
    // 设置响应头，允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 设置响应头，允许携带凭证
    res.setHeader('Access-Control-Allow-Headers', '*');
    // 设置响应体
    setTimeout(() => {
        res.send('Hello World! all-server-delay');
    }, 3000);
    }
);

app.all('/json-server', (req, res) => {
    // 设置响应头，允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 设置响应头，允许携带凭证
    res.setHeader('Access-Control-Allow-Headers', '*'); // metheds
    // 设置响应体
    res.send(str);
});

app.all('/server-checked', (req, res) => {
  
    const obj = {
    exist: 'true',
    message: 'Hello World! all-server-checked'
    }
    // 设置响应体
    res.send(`handleData(${JSON.stringify(obj)})`);
});

app.all('/json-server-jsonp', (req, res) => {

    let callback = req.query.callback;
   
   const obj = {
    exist: 'true',
    message: 'Hello World! all-server-checked'
    }
    // 设置响应体
    res.send(`${callback}(${JSON.stringify(obj)})`);
});

// 4. 监听端口
app.listen(8000, () => {
    console.log("Server is running on port 8000.");
});

const data = {
    name: '郭钊',
    age: 25,
    gender: '男'
}

let str = JSON.stringify(data);