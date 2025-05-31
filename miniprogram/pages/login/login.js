// pages/login/login.js
Page({
    data: {
        agreed: false,
        avatarUrl: '/images/avatar-default.png',
        nickName: '',
        loginText: '授权登录',
        loginDisabled: false,
        avatarChanged: false,  // 新增：标记头像是否已修改
        nickNameChanged: false // 新增：标记昵称是否已修改
    },

    onLoad() {
        if (wx.getStorageSync('openid')) {
            const app = getApp();
            app.globalData.openid = wx.getStorageSync('openid');
            app.globalData.userInfo = wx.getStorageSync('userInfo');
            app.globalData.isLogin = true;
            this.redirectToHome();
        }
    },

    handleLogin() {
        // 验证是否同意协议
        if (!this.data.agreed) {
            wx.showToast({
                title: '请先阅读并同意协议',
                icon: 'none'
            });
            return;
        }
        
        // 验证是否上传头像
        if (!this.data.avatarChanged) {
            wx.showToast({
                title: '请上传您的头像',
                icon: 'none'
            });
            return;
        }
        
        // 验证是否设置了昵称
        if (!this.data.nickNameChanged || !this.data.nickName.trim() || this.data.nickName === '微信用户') {
            wx.showToast({
                title: '请设置您的昵称',
                icon: 'none'
            });
            return;
        }
        
        if (this.data.loginDisabled) return;
        
        this.setData({
            loginText: '登录中...',
            loginDisabled: true
        });
        
        // 直接调用wx.login获取code
        wx.login({
            success: loginRes => {
                console.log('[获取登录凭证code]', loginRes.code);
                this.loginWithCloud(loginRes.code);
            },
            fail: this.handleLoginFail
        });
    },

    // 获取用户头像
    getAvatar(e) {
        const { avatarUrl } = e.detail;
        this.setData({ 
            avatarUrl,
            avatarChanged: true  // 标记头像已修改
        });
        console.log('[用户头像获取成功]', avatarUrl);
    },

    // 获取用户昵称
    getNickname(e) {
        let nickName = e.detail.value;
        let showToast = false;
        
        // 检查昵称长度是否超过10个字
        if (nickName.length > 10) {
            nickName = nickName.substring(0, 10); // 截断前10个字符
            showToast = true;
        }
        
        this.setData({ 
            nickName,
            nickNameChanged: nickName.trim() !== '' && nickName !== '微信用户'
        });
        
        console.log('[用户昵称获取成功]', nickName);
        
        // 如果超过长度限制，显示提示
        if (showToast) {
            wx.showToast({
                title: '昵称不能超过10个字',
                icon: 'none',
                duration: 1500
            });
        }
    },

    // 云函数调用逻辑
    loginWithCloud(code) {
        wx.showLoading({
            title: '登录中...',
            mask: true
        });
        
        // 构造用户数据
        const userData = {
            nickName: this.data.nickName,
            avatarUrl: this.data.avatarUrl,
            gender: 0,
            city: '',
            province: '',
            country: ''
        };
        
        console.log('[准备传递给云函数的用户数据]', userData);
        
        // 调用云函数
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
                type: 'login',
                code: code,
                userInfo: userData
            },
            success: res => {
                console.log('[云函数返回结果]', res);
                wx.hideLoading();
                
                if (res.result && res.result.code) {
                    this.handlePermissionErrors(res.result);
                    return;
                }
                
                if (!res.result || !res.result.openid) {
                    this.resetLoginState('OpenID获取失败');
                    wx.showToast({
                        title: '登录信息异常',
                        icon: 'none'
                    });
                    return;
                }
                
                // 存储登录状态
                this.saveLoginState(res.result, userData);
                
                wx.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1500
                });
                
                this.redirectToHome();
            },
            fail: err => {
                wx.hideLoading();
                console.error('[云函数调用失败]', err);
                this.resetLoginState('云函数错误');
                wx.showToast({
                    title: '服务器连接失败',
                    icon: 'none'
                });
            }
        });
    },
    
    handleAuthFail(err) {
        console.error('[用户拒绝授权]', err);
        this.resetLoginState('授权取消');
        wx.showToast({
            title: '需要授权才能使用完整功能',
            icon: 'none'
        });
    },
    
    handleLoginFail(err) {
        console.error('[wx.login失败]', err);
        this.resetLoginState('登录失败');
        wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
        });
    },
    
    handlePermissionErrors(result) {
        switch (result.code) {
            case 400:
                wx.showToast({ title: '请求参数错误', icon: 'none' });
                break;
            case 401:
                wx.showToast({ title: '未授权访问，请重新登录', icon: 'none' });
                wx.removeStorageSync('openid');
                getApp().globalData.isLogin = false;
                break;
            case 403:
                wx.showToast({ title: '无权访问此资源', icon: 'none' });
                break;
            case 404:
                wx.showToast({ title: '请求资源不存在', icon: 'none' });
                break;
            case 500:
                wx.showToast({ title: '服务器内部错误', icon: 'none' });
                break;
            default:
                wx.showToast({ title: result.message || '登录失败', icon: 'none' });
        }
        
        this.resetLoginState(`错误码: ${result.code}`);
    },
    
    saveLoginState(result, userInfo) {
        const app = getApp();
        const userData = {
            ...userInfo,
            openid: result.openid
        };
        
        wx.setStorageSync('openid', result.openid);
        wx.setStorageSync('userInfo', userData);
        
        app.globalData.openid = result.openid;
        app.globalData.userInfo = userData;
        app.globalData.isLogin = true;
        app.globalData.loginTime = Date.now();
        
        console.log('[登录状态保存成功]', userData);
    },
    
    resetLoginState(reason = '') {
        console.log('[重置登录状态]', reason);
        this.setData({
            loginText: '微信登录',
            loginDisabled: false
        });
    },
    
    redirectToHome() {
        setTimeout(() => {
            wx.switchTab({
                url: '/pages/index/index'
            });
        }, 1500);
    },
    
    toggleAgreement() {
        this.setData({ agreed: !this.data.agreed });
    },
    
    navigateToAgreement() {
        wx.navigateTo({
            url: '/pages/useragreement/useragreement'
        });
    },
    
    navigateToPrivacy() {
        wx.navigateTo({
            url: '/pages/privacypolicy/privacypolicy'
        });
    }
});