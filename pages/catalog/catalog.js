var util = require('../../utils/util.js');
var api = require('../../config/api.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    navList: [],
    categoryList: [],
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    goodsCount: 0,
    scrollHeight: 0
  },
  onShareAppMessage: function () {
    return {
      title: app.globalData.shareTitle,
      desc: app.globalData.shareSubTitle,
      path: '/pages/index/index'
    }
  },


  onLoad: function (options) {
    this.getCatalog();
  },
  getCatalog: function () {
    //CatalogList

    wx.showNavigationBarLoading();

    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogList).then(function (res) {
        that.setData({
          navList: res.data.categoryList,
          currentCategory: res.data.currentCategory
        });
        wx.hideLoading();

      // 隐藏导航栏加载框  
      wx.hideNavigationBarLoading();  
      // 停止下拉动作  
      wx.stopPullDownRefresh();
    }, function(err){
      
      // 隐藏导航栏加载框  
      wx.hideNavigationBarLoading();  
      // 停止下拉动作  
      wx.stopPullDownRefresh();
    });


    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount
      });
    });

  },


  getCurrentCategory: function (id) {
    let that = this;
    util.request(api.CatalogCurrent, { id: id })
      .then(function (res) {
        that.setData({
          currentCategory: res.data.currentCategory
        });
      });
  },

  onPullDownRefresh:function()
  {
    this.getCatalog();
  },
  
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  getList: function () {
    var that = this;
    util.request(api.ApiRootUrl + 'api/catalog/' + that.data.currentCategory.cat_id)
      .then(function (res) {
        that.setData({
          categoryList: res.data,
        });
      });
  },
  switchCate: function (event) {
    var that = this;
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory.id == event.currentTarget.dataset.id) {
      return false;
    }

    this.getCurrentCategory(event.currentTarget.dataset.id);
  }
})