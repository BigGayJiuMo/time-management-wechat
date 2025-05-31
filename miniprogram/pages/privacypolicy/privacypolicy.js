// pages/privacypolicy/privacypolicy.js
Page({
    onLoad: function(options) {
      wx.setNavigationBarTitle({
        title: '隐私政策'
      });
    },
    
    copyEmail: function() {
      wx.setClipboardData({
        data: '384815197@qq.com',
        success: function() {
          wx.showToast({
            title: '邮箱已复制',
            icon: 'success'
          });
        }
      });
    }
  });