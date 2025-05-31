// pages/settings/settings.js
Page({
    data: {
        userInfo: {
            avatarUrl: '/images/avatar-default.png',
            nickName: '微信用户'
        },
        showNicknameModal: false,
        showDeleteAccountModal: false,
        newNickname: '',
        nicknameInputFocus: false,
        deleteConfirmation: '',
        canDeleteAccount: false,
        showToast: false,
        toastMessage: '',
        toastAnimation: {},
        countdown: 0, // 倒计时秒数
        countdownTimer: null, // 倒计时计时器
        isDeleting: false,// 是否正在删除中
        showClearDataModal: false, // 显示清空数据弹窗
        clearDataConfirmation: '', // 清空数据确认输入
        canClearData: false, // 是否允许清空数据
        keepScreenOn: false,
        vibrateOn: true
    },

    onLoad() {
        this.checkLoginStatus();
        const keepScreenOn = wx.getStorageSync('keepScreenOn') || true;
        this.setData({ keepScreenOn });
        const vibrateOn = wx.getStorageSync('vibrateOn') !== false;
        this.setData({ vibrateOn });
    },
    
    onShow() {
        this.checkLoginStatus();
    },
    //屏幕常亮
    toggleKeepScreenOn(e) {
        const keepScreenOn = e.detail.value;
        this.setData({ keepScreenOn });
        wx.setStorageSync('keepScreenOn', keepScreenOn);
        const app = getApp();
        app.globalData.settings = app.globalData.settings || {};
        app.globalData.settings.keepScreenOn = keepScreenOn;
        this.showToast(keepScreenOn ? '屏幕常亮已开启' : '屏幕常亮已关闭');
    },
    // 振动开关
    toggleVibrate(e) {
        const vibrateOn = e.detail.value;
        this.setData({ vibrateOn });
        const app = getApp();
        app.globalData.settings.vibrateOn = vibrateOn;
        wx.setStorageSync('vibrateOn', vibrateOn);
        this.showToast(vibrateOn ? '振动提醒已开启' : '振动提醒已关闭');
      },
    // 检查登录状态
    checkLoginStatus() {
        const app = getApp();
        if (app.globalData.isLogin && app.globalData.userInfo) {
            this.setData({
            userInfo: app.globalData.userInfo
            });
        } else {
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
            app.globalData.userInfo = userInfo;
            app.globalData.isLogin = true;
            this.setData({
                userInfo
            });
            } else {
            this.setData({
                userInfo: {
                avatarUrl: '/images/avatar-default.png',
                nickName: '微信用户'
                }
            });
            }
        }
    },

    // 点击头像
    onAvatarTap() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
            const tempFilePath = res.tempFiles[0].tempFilePath;
            this.setData({
                'userInfo.avatarUrl': tempFilePath
            });
            this.updateUserInfo();
            }
        });
    },

    // 点击昵称
    onNicknameTap() {
        this.setData({
            showNicknameModal: true,
            newNickname: this.data.userInfo.nickName,
            nicknameInputFocus: true
        });
    },

    // 昵称输入
    onNicknameInput(e) {
        const value = e.detail.value;
        // 限制输入长度不超过10个字符
        if (value.length > 10) {
            this.setData({
            newNickname: value.substring(0, 10)
            });
            wx.showToast({
            title: '昵称不能超过10个字',
            icon: 'none',
            duration: 1500
            });
        } else {
            this.setData({
            newNickname: value
            });
        }
    },

    // 确认修改昵称
    confirmNickname() {
        const nickname = this.data.newNickname.trim();
        if (!nickname) {
            this.showToast('昵称不能为空');
            return;
        }
        
        // 检查昵称长度是否超过10个字
        if (nickname.length > 10) {
            this.showToast('昵称不能超过10个字');
            return;
        }
        
        this.setData({
            'userInfo.nickName': nickname,
            showNicknameModal: false
        });
        this.updateUserInfo();
        },

        // 取消修改昵称
        cancelNickname() {
        this.setData({
            showNicknameModal: false,
            nicknameInputFocus: false
        });
        },
    //显示清空数据弹窗
    showClearDataModal() {
        this.setData({
            showClearDataModal: true,
            clearDataConfirmation: '',
            canClearData: false,
            countdown: 3 // 设置3秒倒计时
        });
        
        // 开始倒计时
        this.startClearDataCountdown();
    },
    
    //清空数据倒计时
    startClearDataCountdown() {
        // 清除之前的计时器
        if (this.data.countdownTimer) {
            clearInterval(this.data.countdownTimer);
        }
        
        const timer = setInterval(() => {
            if (this.data.countdown > 1) {
                this.setData({
                    countdown: this.data.countdown - 1
                });
            } else {
                // 倒计时结束
                clearInterval(timer);
                this.setData({
                    canClearData: this.data.clearDataConfirmation === 'CLEAR',
                    countdown: 0
                });
            }
        }, 1000);
        
        this.setData({
            countdownTimer: timer
        });
    },
    // 清空数据确认输入
    onClearDataConfirmInput(e) {
        const input = e.detail.value.trim();
        const isCorrect = input === 'CLEAR';
        
        this.setData({
            clearDataConfirmation: input,
            canClearData: isCorrect && this.data.countdown === 0
        });
    },
    
    // 取消清空数据
    cancelClearData() {
        if (this.data.countdownTimer) {
            clearInterval(this.data.countdownTimer);
        }
        
        this.setData({
            showClearDataModal: false,
            countdown: 0
        });
    },
    
    // 确认清空数据
    confirmClearData() {
        // 添加输入验证
        if (this.data.clearDataConfirmation !== 'CLEAR') {
            wx.showToast({
                title: '请输入正确的确认词',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        if (!this.data.canClearData || this.data.isDeleting) return;
        
        this.setData({ isDeleting: true });
        
        wx.showLoading({ title: '正在清空数据...', mask: true });
        
        const app = getApp();
        const openid = app.globalData.openid;
        
        if (!openid) {
            wx.hideLoading();
            wx.showToast({ title: '未获取到用户信息，请重试', icon: 'none' });
            this.setData({ isDeleting: false });
            return;
        }
        
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'clearUserData', openid },
            success: (res) => {
                wx.hideLoading();
                
                if (res.result.code === 0) {
                    wx.showToast({
                        title: '数据已清空',
                        icon: 'success',
                        duration: 2000
                    });
                    
                    // 关闭弹窗
                    this.setData({ 
                        showClearDataModal: false,
                        isDeleting: false 
                    });
                } else {
                    wx.showToast({
                        title: '清空失败：' + (res.result.message || '未知错误'),
                        icon: 'none'
                    });
                    this.setData({ isDeleting: false });
                }
            },
            fail: (err) => {
                wx.hideLoading();
                wx.showToast({ title: '清空失败，请重试', icon: 'none' });
                console.error('清空数据失败:', err);
                this.setData({ isDeleting: false });
            }
        });
    },
        // 显示注销账号弹窗
        showDeleteAccountModal() {
        this.setData({
            showDeleteAccountModal: true,
            deleteConfirmation: '',
            canDeleteAccount: false,
            countdown: 3 // 设置3秒倒计时
        });
        
        // 开始倒计时
        this.startCountdown();
        },

        // 开始倒计时
        startCountdown() {
        // 清除之前的计时器
        if (this.data.countdownTimer) {
            clearInterval(this.data.countdownTimer);
        }
        
        const timer = setInterval(() => {
            if (this.data.countdown > 1) {
            this.setData({
                countdown: this.data.countdown - 1
            });
            } else {
            // 倒计时结束
            clearInterval(timer);
            this.setData({
                canDeleteAccount: this.data.deleteConfirmation === 'DELETE',
                countdown: 0
            });
            }
        }, 1000);
        
        this.setData({
            countdownTimer: timer
        });
    },

    // 注销账号确认输入
    onDeleteConfirmInput(e) {
        const input = e.detail.value.trim();
        const isCorrect = input === 'DELETE';
        
        this.setData({
          deleteConfirmation: input,
          canDeleteAccount: isCorrect && this.data.countdown === 0
        });
      },

    // 取消注销账号 - 修复：添加这个函数实现
    cancelDeleteAccount() {
        // 清除倒计时
        if (this.data.countdownTimer) {
            clearInterval(this.data.countdownTimer);
        }
        
        this.setData({
            showDeleteAccountModal: false,
            countdown: 0
        });
    },

    // 确认注销账号
    confirmDeleteAccount() {
        // 添加输入验证
        if (this.data.deleteConfirmation !== 'DELETE') {
            wx.showToast({
            title: '请输入正确的确认词',
            icon: 'none',
            duration: 2000
            });
            return;
        }

        if (!this.data.canDeleteAccount || this.data.isDeleting) return;
        
        this.setData({ isDeleting: true });
        
        wx.showLoading({ title: '正在注销账号...', mask: true });
        
        const app = getApp();
        const openid = app.globalData.openid;
        
        if (!openid) {
            wx.hideLoading();
            wx.showToast({ title: '未获取到用户信息，请重试', icon: 'none' });
            this.setData({ isDeleting: false });
            return;
        }
        
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'deleteUserAccount', openid },
            success: (res) => {
                wx.hideLoading();
                
                if (res.result.code === 0) {
                    // 清除本地用户数据
                    app.globalData.isLogin = false;
                    app.globalData.userInfo = null;
                    app.globalData.openid = null;
                    wx.removeStorageSync('userInfo');
                    wx.removeStorageSync('openid');
                    
                    wx.showToast({
                        title: '账号已注销',
                        icon: 'success',
                        duration: 2000,
                        success: () => {
                            setTimeout(() => {
                                wx.reLaunch({ url: '/pages/login/login' });
                            }, 2000);
                        }
                    });
                } else {
                    wx.showToast({
                        title: '注销失败：' + (res.result.message || '未知错误'),
                        icon: 'none'
                    });
                    this.setData({ isDeleting: false });
                }
            },
            fail: (err) => {
                wx.hideLoading();
                wx.showToast({ title: '注销失败，请重试', icon: 'none' });
                console.error('注销账号失败:', err);
                this.setData({ isDeleting: false });
            }
        });
    },

    // 更新用户信息
    updateUserInfo() {
    const { userInfo } = this.data;
    
    // 保存到全局数据
    const app = getApp();
    app.globalData.userInfo = userInfo;
    
    // 保存到本地缓存
    wx.setStorageSync('userInfo', userInfo);
    
    this.showToast('个人资料更新成功');
    },

    // 显示提示
    showToast(message) {
        const animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        });
        
        this.setData({
            showToast: true,
            toastMessage: message,
            toastAnimation: animation.opacity(1).step().export()
        });
        
        setTimeout(() => {
            animation.opacity(0).step();
            this.setData({
            toastAnimation: animation.export()
            });
            
            setTimeout(() => {
            this.setData({
                showToast: false
            });
            }, 300);
        }, 2000);
    },
    
    // 页面卸载时清除计时器
    onUnload() {
        if (this.data.countdownTimer) {
            clearInterval(this.data.countdownTimer);
        }
    }
});