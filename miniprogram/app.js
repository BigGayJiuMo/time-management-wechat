// app.js
App({
    globalData: {
        openid: null,
        userInfo: null,
        isLogin: false,
        loginTime: 0,
        settings: {
            keepScreenOn: true,
            vibrateOn: true
        }
    },
    
    onLaunch() {
        // 初始化云开发环境
        wx.cloud.init({
            env: 'YOUR_ENV_ID',
            traceUser: true,
        });
        const keepScreenOn = wx.getStorageSync('keepScreenOn') ?? true;
        const vibrateOn = wx.getStorageSync('vibrateOn') ?? true;
        this.globalData.settings = {keepScreenOn,vibrateOn};
        wx.authorize({
            scope: 'scope.writeVibrate',
            success: () => console.log('振动权限已授权'),
            fail: (err) => {
                console.warn('振动权限未授权:', err);
                wx.showModal({
                title: '提示',
                content: '需要振动权限才能提供触觉反馈，请前往设置开启',
                showCancel: false
                });
            }
        });
        wx.setKeepScreenOn({
            keepScreenOn: keepScreenOn
        });
        // 检查登录状态
        const openid = wx.getStorageSync('openid');
        if (openid) {
            this.globalData.openid = openid;
            this.globalData.userInfo = wx.getStorageSync('userInfo');
            this.globalData.isLogin = true;
        }
    },
    
    // 检查登录状态是否有效（例如15天有效期）
    checkLoginValid() {
        if (this.globalData.loginTime && 
            (Date.now() - this.globalData.loginTime) > 15 * 24 * 60 * 60 * 1000) {
            this.clearLoginState();
            return false;
        }
        return this.globalData.isLogin;
    },
    
    clearLoginState() {
        wx.removeStorageSync('openid');
        wx.removeStorageSync('userInfo');
        this.globalData.openid = null;
        this.globalData.userInfo = null;
        this.globalData.isLogin = false;
    }
  });