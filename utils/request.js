// utils/request.js

let BASE_URL // 可以根据环境变化配置为不同的域名或 IP
if (process.env.NODE_ENV === 'development') {
	BASE_URL = 'http://127.0.0.1:3000'; // 开发环境
} else if (process.env.NODE_ENV === 'production') {
	BASE_URL = 'https://api.yourdomain.com'; // 生产环境
}
// 封装请求函数
export const request = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + options.url, // 这里不需要直接写死为 localhost，允许动态拼接
			method: options.method || 'GET', // 支持 GET, POST, DELETE 等方法
			data: options.data || {}, // 支持动态传递请求体数据
			header: options.header || {
				'Content-Type': 'application/json'
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data); // 请求成功，返回数据
				} else {
					reject('请求失败'); // 请求失败，返回错误提示
				}
			},
			fail: (err) => {
				reject(err); // 请求失败的回调
			}
		});
	});
};

// 封装 POST 请求
export const post = (url, data) => {
	return request({
		url: url,
		method: 'POST',
		data: data
	});
};

// 封装 GET 请求
export const get = (url, data) => {
	return request({
		url: url,
		method: 'GET',
		data: data
	});
};

// 封装 DELETE 请求
export const del = (url, data) => {
	return request({
		url: url,
		method: 'DELETE',
		data: data
	});
};