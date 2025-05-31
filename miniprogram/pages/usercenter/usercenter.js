// pages/usercenter/usercenter.js
Page({
    data: {
    userInfo: null,
    isLogin: false
    },
    onShow() {
    this.checkLoginStatus();
    },
    // 检查登录状态
    checkLoginStatus() {
    const app = getApp();
    if (app.globalData.isLogin && app.globalData.userInfo) {
        this.setData({
        userInfo: app.globalData.userInfo,
        isLogin: true
        });
    } else {
        // 尝试从本地存储获取
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
        app.globalData.userInfo = userInfo;
        app.globalData.isLogin = true;
        this.setData({
            userInfo,
            isLogin: true
        });
        } else {
        this.setData({
            isLogin: false,
            userInfo: null
        });
        }
    }
    },
    // 跳转到登录页面
    goToLogin() {
    wx.navigateTo({
        url: '/pages/login/login'
    });
    },
    // 退出登录
    logout() {
        const app = getApp();
        app.globalData.isLogin = false;
        app.globalData.userInfo = null;
        app.globalData.openid = null;
        
        // 清除所有页面的数据缓存
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('openid');
        
        // 更新当前页面数据
        this.setData({
            isLogin: false,
            userInfo: null
        });
        
        // 通知所有页面更新状态
        const pages = getCurrentPages();
        pages.forEach(page => {
            // 更新用户信息
            page.setData({
                userInfo: null,
                isLogin: false
            });
            
            // 特殊处理首页 - 刷新任务列表
            if (page.route === 'pages/index/index') {
                page.getUserTasks();
            }
            
            // 特殊处理统计页面 - 重置数据
            if (page.route === 'pages/statistics/statistics') {
                page.setData({
                    logs: [],
                    stats: {
                        totalCount: 0,
                        todayCount: 0,
                        totalMinutes: 0
                    },
                    activeTab: 'all',
                    dateRange: ['', ''],
                    filterCate: '',
                    filterCateDisplay: '全部',
                    filterCateIndex: 0
                });
            }
        });
        
        wx.showToast({
            title: '已退出登录',
            icon: 'success'
        });
        
        // 强制刷新首页
        wx.reLaunch({
            url: '/pages/index/index'
        });
    }
});