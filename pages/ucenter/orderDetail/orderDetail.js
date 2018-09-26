var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    handleOption: {},
    isPending: true, // 是否是审核模式
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id
    });
    this.getOrderDetail();

    util.getOnlineSystemConfig((config)=>{
        if(config)
        {
          this.setData({
            isPending : config.is_pending!=0
          });
        }
        
    })
  },
  getOrderDetail() {
    let that = this;
    util.request(api.OrderDetail, {
      orderId: that.data.orderId
    }).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          orderInfo: res.data.orderInfo,
          orderGoods: res.data.orderGoods,
          handleOption: res.data.handleOption
        });
        //that.payTimer();
      }else{
        let duration = util.showErrorToast(res.errmsg);
        setTimeout(() => {
          wx.navigateBack();  
        }, duration);
      }
    });
  },
  payTimer() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    setInterval(() => {
      console.log(orderInfo);
      orderInfo.add_time -= 1;
      that.setData({
        orderInfo: orderInfo,
      });
    }, 1000);
  },
  payOrder() {
    let that = this;
    util.request(api.PayPrepayId, {
      orderId: that.data.orderId || 15
    }).then(function (res) {
      if (res.errno === 0) {
        const payParam = res.data;
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            console.log(res)
          },
          'fail': function (res) {
            console.log(res)
          }
        });
      }
    });
  },

  pay()
  {
    let that = this;

    wx.showModal({
      title: '付款流程提醒',
      content: '请长按保存图片，再通过微信首页扫一扫-相册-选择此图-支付金额',
      confirmText:'知道了',
      showCancel:false,
      success: function (res) {
          var imgalist = [that.data.orderInfo.pay_qrcode];
          wx.previewImage({  
            current: imgalist,
            urls: imgalist,
          })
      }
    });
  },

  contactSeller()
  {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.orderInfo.seller_contact
    })
  },

  cancelOrder()
  {

    let that = this;

    wx.showModal({
      title: '',
      content: '确定要取消该订单吗？',
      success: function (res) {
        if (res.confirm) {
          util.request(api.OrderCancel, {
            orderId: that.data.orderId
          }).then(function (res) {
            if (res.errno === 0) {
              that.getOrderDetail();
            }else{
              let duration = util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
    
  },

  confirmOrder()
  {
    let that = this;

    wx.showModal({
      title: '',
      content: '确定已收货？',
      success: function (res) {
        if (res.confirm) {
          util.request(api.OrderConfirm, {
            orderId: that.data.orderId
          }).then(function (res) {
            if (res.errno === 0) {
              that.getOrderDetail();
            }else{
              let duration = util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
    
  },


  goExpress()
  {
    let that = this;
    wx.navigateTo({
      url: '/pages/ucenter/express/express?id=' + that.data.orderId,
    })
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
  }
})