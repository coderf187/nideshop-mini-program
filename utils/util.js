var api = require('../config/api.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Nideshop-Token': wx.getStorageSync('token')
      },
      success: function (res) {
        console.log("success");

        if (res.statusCode == 200) {

          if (res.data.errno == 401) {
            //需要登录后才可以操作

            let code = null;
            return login().then((res) => {
              code = res.code;
              return getUserInfo();
            }).then((userInfo) => {
              //登录远程服务器
              request(api.AuthLoginByWeixin, { code: code, userInfo: userInfo }, 'POST').then(res => {
                if (res.errno === 0) {
                  //存储用户信息
                  wx.setStorageSync('userInfo', res.data.userInfo);
                  wx.setStorageSync('token', res.data.token);
                  
                  resolve(res);
                } else {
                  reject(res);
                }
              }).catch((err) => {
                reject(err);
              });
            }).catch((err) => {
              reject(err);
            })
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function (err) {
        reject(err)
        console.log("failed")
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //登录远程服务器
          console.log(res)
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        console.log(res)
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg, duration = 2000, mask = false) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png',
    duration : duration,
    mask: mask
  });
  return duration;
}

function showOkToast(msg, duration = 2000, mask = false) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_ok.png',
    duration : duration,
    mask: mask
  });
  return duration;
}

function showNoIconToast(msg, duration = 2000, mask = false) {
  wx.showToast({
    title: msg,
    icon : 'none',
    duration : duration,
    mask: mask
  });
  return duration;
}

/**
 * 保存网络图片到相册
 * @param {图片url} imgUrl
 * @param {isSuccess：是否成功，isUserReject：是否用户拒绝} callback(isSuccess, isUserReject) 
 */
function saveImgToPhotosAlbum(imgUrl, callback){  
  let that =this;
  wx.downloadFile({  
    url: imgUrl,  
    success:function(res){  
      console.log(res)  
      wx.saveImageToPhotosAlbum({  
        filePath: res.tempFilePath,  
        success: function (res) {  
          console.log(res)  
          if(callback)
          {
            callback(true, false)
          }
        },  
        fail: function (res) {  
          console.log(res)  
          if(callback)
          {
            callback(false, true)
          }
        }  
      })  
    },  
    fail:function(res){  
      console.log('fail')  
      if(callback)
      {
        callback(false, false)
      }
    }  
  })  
}

let cacheOnlineSystemConfig = null;

/**
 * 获取在线参数
 * @param {回调} callback 
 */
function getOnlineSystemConfig(callback)
{
  if(!cacheOnlineSystemConfig)
  {
    let that = this;
    that.request(api.SystemConfig, {
    }).then(function (res) {
      if (res.errno === 0) {
        that.cacheOnlineSystemConfig = res.data;
        if(callback)callback(res.data);
      }else{
        if(callback)callback(null);
      }
    });
  }else{
    if(callback)callback(cacheOnlineSystemConfig);
  }
} 


module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  showOkToast,
  showNoIconToast,
  checkSession,
  login,
  getUserInfo,
  getOnlineSystemConfig,
  saveImgToPhotosAlbum,
}


