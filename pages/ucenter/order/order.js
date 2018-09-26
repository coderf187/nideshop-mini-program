var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data:{
    orderList: []
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

    // this.getOrderList();
  },
  getOrderList(){
    wx.showNavigationBarLoading();
    
    let that = this;
    util.request(api.OrderList).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          orderList: res.data.data
        });
      }
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

    
  },
  payOrder(){
    wx.redirectTo({
      url: '/pages/pay/pay',
    })
  },

  onPullDownRefresh:function()
  {
    this.getOrderList();
  },

  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this.getOrderList();
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})