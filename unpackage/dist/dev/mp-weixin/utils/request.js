"use strict";
const common_vendor = require("../common/vendor.js");
let BASE_URL;
{
  BASE_URL = "http://127.0.0.1:3000";
}
const request = (options) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: BASE_URL + options.url,
      // 这里不需要直接写死为 localhost，允许动态拼接
      method: options.method || "GET",
      // 支持 GET, POST, DELETE 等方法
      data: options.data || {},
      // 支持动态传递请求体数据
      header: options.header || {
        "Content-Type": "application/json"
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject("请求失败");
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
const post = (url, data) => {
  return request({
    url,
    method: "POST",
    data
  });
};
const get = (url, data) => {
  return request({
    url,
    method: "GET",
    data
  });
};
const del = (url, data) => {
  return request({
    url,
    method: "DELETE",
    data
  });
};
exports.del = del;
exports.get = get;
exports.post = post;
