var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    url : ''
  },
  onLoad: function (options) {

    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      url: options.url
    });
  },
 
  onReady: function () {

  },
  onShow: function () {
  },
  
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  }
})