#!/usr/bin/env node
/**
 * 测试请求一个重定向地址
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const config = require('./config.json');
let cookie = '';
const req = http.request('http://readfree.me/auth/douban/login/', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    const location = parseAuthUrl(res.headers.location);
    parseCookie(res.headers['set-cookie']);
    viewPage(location);
});

req.end();
function parseCookie(strs) {
    cookie = [];
    for(let str of strs) {
        cookie.push(str.split(';')[0]);
    }
    cookie = cookie.join(';');
}
function parseAuthUrl(location) {
    const urlObj = url.parse(location);
    urlObj.origin = urlObj.protocol + '//' + urlObj.host;
    return urlObj;
}

function viewPage(location) {
    https.request(Object.assign({}, location, {
        headers: config.headers
    }), res => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        login(location, res.headers);
    }).end();
}


function login(urlObj, headers) {
    const postData = querystring.stringify(config.account);
    const loginReq = https.request(Object.assign({}, urlObj, {
        method: 'POST',
        headers: Object.assign({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Cookie': 'bid=' + headers['x-douban-newbid']
        }, config.headers)
    }), (res) => {
        console.log(`登录 STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        redirected(res.headers.location);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
        console.log('登录结束');
    });

    loginReq.write(postData);
    loginReq.end();
}

function redirected(location) {
    http.get(Object.assign(url.parse(location), {
        headers: {
            Cookie: cookie
        }
    }), res => {
        console.log(`重定向 ${location}  -> STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            // console.log('No more data in response.');
            const location = res.headers.location;
            if (location && location.indexOf('http') === -1) {
                console.log('重定向到首页');
                res.headers['set-cookie'] && parseCookie(res.headers['set-cookie']);
                redirected('http://readfree.me' + location);

                if (location === '/accounts/checkin/') {
                    console.log('５ｓ后重定向到首页，检查结束后重定向');
                    setTimeout(function () {
                        redirected('http://readfree.me/');
                    }, 5000);
                }
            }
            else if (location) {
                console.log('重定向到:', location);
                redirected(location);
            }
        });
    })
}