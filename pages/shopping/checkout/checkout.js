var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');

var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    checkedCoupon: [],
    couponList: [],
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00,    //快递费
    couponPrice: 0.00,     //优惠券的价格
    orderTotalPrice: 0.00,  //订单总价
    actualPrice: 0.00,     //实际需要支付的总价
    addressId: 0,
    couponId: 0,
    postscript:'', // 用户留言
    contentLength:0,
    isPending:true// 是否是审核模式
  },
  onLoad: function (options) {

    util.getOnlineSystemConfig((config)=>{
      if(config)
      {
        this.setData({
          isPending : config.is_pending!=0
        });
      }
    })

  },
  getCheckoutInfo: function () {
    let that = this;
    util.request(api.CartCheckout, { addressId: that.data.addressId, couponId: that.data.couponId }).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          actualPrice: res.data.actualPrice,
          checkedCoupon: res.data.checkedCoupon,
          couponList: res.data.couponList,
          couponPrice: res.data.couponPrice,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice
        });
      }
      wx.hideLoading();
    });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/shopping/address/address',
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '/pages/shopping/addressAdd/addressAdd',
    })
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {

    // 页面初始化 options为页面跳转所带来的参数

    try {
      var addressId = wx.getStorageSync('addressId');
      if (addressId) {
        this.setData({
          'addressId': addressId
        });
      } else{

        if(this.data.checkedAddress && this.data.checkedAddress.id && this.data.checkedAddress.id>0)
        {
          this.setData({
            'addressId': this.data.checkedAddress.id
          });
        }
      }

      var couponId = wx.getStorageSync('couponId');
      if (couponId) {
        this.setData({
          'couponId': couponId
        });
      }
    } catch (e) {
      // Do something when catch error
    }

    // 页面显示
    wx.showLoading({
      title: '加载中...',
    })
    this.getCheckoutInfo();

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  submitOrder: function () {
    // if (this.data.addressId <= 0) {
    //   util.showErrorToast('请选择收货地址');
    //   return false;
    // }

    if(!this.data.checkedAddress || !this.data.checkedAddress.id || this.data.checkedAddress.id<=0)
    {
      util.showErrorToast('请选择收货地址');
      return false;
    }

    this.data.addressId = this.data.checkedAddress.id;

    util.request(api.OrderSubmit, { addressId: this.data.addressId, couponId: this.data.couponId, postscript:this.data.postscript }, 'POST').then(res => {
      if (res.errno === 0) {
        const orderId = res.data.orderInfos[0].id;
        // pay.payOrder(parseInt(orderId)).then(res => {
        //   wx.redirectTo({
        //     url: '/pages/payResult/payResult?status=1&orderId=' + orderId
        //   });
        // }).catch(res => {
        //   wx.redirectTo({
        //     url: '/pages/payResult/payResult?status=0&orderId=' + orderId
        //   });
        // });

        // let duration = util.showOkToast('下单成功', 2000, true);
        // setTimeout(function () {  
        //   wx.redirectTo({
        //     url: '/pages/ucenter/order/order'
        //   });
        // }, duration);

        wx.showModal({
          title: '下单成功',
          content: '我们将尽快与您联系',
          confirmText:'查看订单',
          cancelText: '回到首页',
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/ucenter/order/order'
              });
            }else if(res.cancel){

              wx.switchTab({
                url: '/pages/index/index',
              });
            }
          }
        });
        
      } else {
        //util.showErrorToast('下单失败');
        util.showNoIconToast(res.errmsg, 3000);
      }
    });
  },

  bindinputContent(event) {
    this.setData({
      postscript: event.detail.value,
      contentLength : event.detail.value.length,
    });
  },

  seePay :function()
  {
    let that = this;
    

    wx.showModal({
      title: '付款流程提醒',
      content: '请长按保存图片，再通过微信首页扫一扫-相册-选择此图-支付金额',
      confirmText:'知道了',
      showCancel:false,
      success: function (res) {
        var imgalist = ['https://cdn.flyinthesky.cn/static/upload/pics/final/21a03718-19bb-4e4b-acd2-2a0c95bfccc8.jpg'];
        wx.previewImage({  
          current: imgalist,
          urls: imgalist,
        });
      }
    });
  },

  savePay :function()
  {

    util.saveImgToPhotosAlbum('https://cdn.flyinthesky.cn/static/upload/pics/final/21a03718-19bb-4e4b-acd2-2a0c95bfccc8.jpg',(isSuccess, isUserReject)=>{
      if(isSuccess)
      {

        wx.showModal({
          title: '保存成功',
          content: '您可以通过微信首页识别该二维码付款了',
          confirmText:'知道了',
          showCancel:false,
          success: function (res) {
          }
        })

      }
      else
      {
        if(isUserReject)
        {
          util.showErrorToast("请允许保存")
        }else{
          util.showErrorToast("保存失败")
        }
      }

    });
    
  }
})