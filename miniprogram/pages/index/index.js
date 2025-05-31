// pages/index/index.js
const app = getApp()

Page({
    data: {
        clockShow: false,// 控制专注时钟界面的显示/隐藏
        clockHeight: 0,
        time: '5',
        mTime: 300000,
        timeStr: '05:00',
        rate: '',
        timer: null,// 存储倒计时定时器的引用
        cateArr: [],
        cateActive: '0',// 当前选中的任务分类索引
        showFinishModal: false,
        // 专注控制按钮状态
        okShow: false,
        pauseShow: true,
        continueCancelShow: false,
        // 任务管理相关
        showAddTaskModal: false,
        newTaskName: '',
        //删除任务
        showDeleteConfirm: false,  
        deleteTaskIndex: null,    
        deleteTaskName: '',      
        deleteTaskId: null,
        // 保存状态标志
        isSaving: false 
    },
    onLoad: function() {
        var res = wx.getSystemInfoSync();
        var rate = 750 / res.windowWidth;
        this.setData({
            rate: rate,
            clockHeight: rate * res.windowHeight
        })
        this.getUserTasks();
    },
    onShow: function() {
        this.applyScreenOnSetting();
        const app = getApp();
        // 检查登录状态
        if (!app.globalData.isLogin) {
            // 尝试从本地存储获取
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
                app.globalData.userInfo = userInfo;
                app.globalData.isLogin = true;
            } else {
                // 显示登录提示框
                wx.showModal({
                    title: '未登录',
                    content: '您还未登录，是否前往登录？',
                    confirmText: '去登录',
                    cancelText: '稍后再说',
                    success: (res) => {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/login/login'
                            });
                        }
                    }
                });
            }
        }
        
        // 如果已登录或选择稍后登录，继续执行原有逻辑
        var res = wx.getSystemInfoSync();
        var rate = 750 / res.windowWidth;
        this.setData({
            rate: rate,
            clockHeight: rate * res.windowHeight
        });
        
        // 获取任务列表
        this.getUserTasks();
    },
    // 应用屏幕常亮设置
    applyScreenOnSetting() {
        const app = getApp();
        const settings = app.globalData.settings || {};
        
        // 从全局设置获取，如果没有则从本地缓存获取
        let keepScreenOn = settings.keepScreenOn;
        if (keepScreenOn === undefined) {
            keepScreenOn = wx.getStorageSync('keepScreenOn') || true;
        }
        
        // 设置屏幕常亮
        wx.setKeepScreenOn({
            keepScreenOn: keepScreenOn
        });
        
        console.log('屏幕常亮状态:', keepScreenOn);
    },
    slideChange: function(e) {
        // 滑块调整不需要登录
        this.setData({
            time: e.detail.value
        });
    },
    clickCate: function(e) {
        if (!this.checkLogin(() => {
            this.setData({
                cateActive: e.currentTarget.dataset.index
            });
        })) return;
    },
    start: function() {
        if (!this.checkLogin(() => {
            this.setData({
                clockShow: true,
                mTime: this.data.time * 60 * 1000,
                timeStr: parseInt(this.data.time) >= 10 ? this.data.time + ':00' : '0' + this.data.time + ':00'
            });
            this.drawBg();
            this.drawActive();
        })) return;
    },
    //圆环倒计时
    drawBg: function() {
        var lineWidth = 6 / this.data.rate;
        var ctx = wx.createCanvasContext('progress_bg');
        ctx.setLineWidth(lineWidth);
        // 背景圆环颜色为白色半透明
        ctx.setStrokeStyle('rgba(255, 255, 255, 0.3)');
        ctx.setLineCap('round');
        ctx.beginPath();
        ctx.arc(400 / this.data.rate / 2, 400 / this.data.rate / 2, 400 / this.data.rate / 2 - 2 * lineWidth, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.draw();
    },
    drawActive: function() {
        var _this = this;
        var timer = setInterval(function() {
            var angle = 1.5 + 2 * (_this.data.time * 60 * 1000 - _this.data.mTime) / (_this.data.time * 60 * 1000);
            var currentTime = _this.data.mTime - 100;
            _this.setData({
                mTime: currentTime
            });
            
            if (angle < 3.5) {
                if (currentTime % 1000 == 0) {
                    var timeStr1 = currentTime / 1000;
                    var timeStr2 = parseInt(timeStr1 / 60);
                    var timeStr3 = (timeStr1 - timeStr2 * 60) >= 10 ? (timeStr1 - timeStr2 * 60) : '0' + (timeStr1 - timeStr2 * 60);
                    timeStr2 = timeStr2 >= 10 ? timeStr2 : '0' + timeStr2;
                    _this.setData({
                        timeStr: timeStr2 + ':' + timeStr3
                    })
                }
                
                var lineWidth = 6 / _this.data.rate;
                var ctx = wx.createCanvasContext('progress_active');
                ctx.setLineWidth(lineWidth);
                // 进度条颜色为白色
                ctx.setStrokeStyle('#ffffff');
                ctx.setLineCap('round');
                ctx.beginPath();
                ctx.arc(400 / _this.data.rate / 2, 400 / _this.data.rate / 2, 400 / _this.data.rate / 2 - 2 * lineWidth,
                1.5 * Math.PI, angle * Math.PI, false);
                ctx.stroke();
                ctx.draw();
            } else {
                // 获取当前时间并格式化为字符串
                const now = new Date();
                const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                // 检查振动设置并触发振动
                const app = getApp();
                const vibrateOn = app.globalData.settings?.vibrateOn ?? wx.getStorageSync('vibrateOn') ?? true;
                if (vibrateOn) {
                    console.log('振动设置开启，准备触发振动');
                    wx.vibrateLong({
                        success: () => {
                            console.log('振动提醒已成功触发');
                            // 添加额外短振动确认
                            setTimeout(() => {
                                wx.vibrateShort();
                            }, 500);
                        },
                        fail: (err) => {
                            console.error('振动失败，错误信息:', err);
                            wx.showToast({
                                title: '振动失败，请检查权限',
                                icon: 'none'
                            });
                        }
                    });
                } else {
                    console.log('振动设置已关闭');
                }
                // 专注完成，保存日志到云数据库
                console.log('[小程序] 准备调用云函数 addLogs', {
                    date: dateStr,
                    cate: _this.data.cateArr[_this.data.cateActive].text,
                    time: _this.data.time
                });
                
                wx.cloud.callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'addLogs',
                        date: dateStr,
                        cate: _this.data.cateArr[_this.data.cateActive].text,
                        time: _this.data.time
                    },
                    success: res => {
                        console.log('[小程序] 日志保存成功', res);
                    },
                    fail: err => {
                        console.error('[小程序] 日志保存失败', err);
                    }
                });
                
                _this.setData({
                    timeStr: '00:00',
                    okShow: true,
                    pauseShow: false,
                    continueCancelShow: false,
                    showFinishModal: true
                });
                clearInterval(timer);
            }
        }, 100)
        _this.setData({
            timer: timer
        })
    },
    // 添加关闭弹窗的方法
    closeFinishModal: function() {
        this.setData({
            showFinishModal: false,
        });
    },
    pause: function() {
        clearInterval(this.data.timer);
        this.setData({
            pauseShow: false,
            continueCancelShow: true,
            okShow: false
        })
    },
    continue: function() {
        this.drawActive();
        this.setData({
            pauseShow: true,
            continueCancelShow: false,
            okShow: false
        })
    },
    cancel: function() {
        clearInterval(this.data.timer);
        this.setData({
            pauseShow: true,
            continueCancelShow: false,
            okShow: false,
            clockShow: false
        })
    },
    ok: function() {
        if (this.data.showFinishModal) {
            wx.showToast({
                title: '请先确认专注完成提醒',
                icon: 'none'
            });
            return;
        }
        
        clearInterval(this.data.timer);
        this.setData({
            pauseShow: true,
            continueCancelShow: false,
            okShow: false,
            clockShow: false
        })
    },
    showAddTaskModal: function() {
        if (!this.checkLogin(() => {
            this.setData({
                showAddTaskModal: true,
                newTaskName: ''
            });
        })) return;
    },
    hideAddTaskModal: function() {
        this.setData({ showAddTaskModal: false });
    },
    onTaskNameInput: function(e) {
        this.setData({ newTaskName: e.detail.value });
    },
    // 获取用户任务列表
    getUserTasks: async function() {
        try {
            const app = getApp();
            let allTasks = [];
            
            // 获取系统默认任务
            const sysRes = await wx.cloud.callFunction({
                name: 'quickstartFunctions',
                data: {
                    type: 'manageTasks',
                    action: 'getTasks',
                    collection: 'default_tasks'
                }
            });
            
            if (sysRes.result && sysRes.result.data) {
                // 为系统任务添加标识
                const sysTasks = sysRes.result.data.map(task => {
                    return {
                        ...task,
                        isSystem: true  // 标记为系统任务
                    };
                });
                allTasks = [...sysTasks];
            }
            
            // 如果用户已登录，获取用户自定义任务
            if (app.globalData.isLogin) {
                const userRes = await wx.cloud.callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'manageTasks',
                        action: 'getTasks',
                        collection: 'user_tasks',
                        openid: app.globalData.openid
                    }
                });
                
                if (userRes.result && userRes.result.data) {
                    // 为用户任务添加标识
                    const userTasks = userRes.result.data.map(task => {
                        return {
                            ...task,
                            isSystem: false  // 标记为用户自定义任务
                        };
                    });
                    allTasks = [...allTasks, ...userTasks];
                }
            }
            
            this.setData({
                cateArr: allTasks
            });
        } catch (err) {
            console.error('获取任务失败', err);
            wx.showToast({
                title: '获取任务失败',
                icon: 'none'
            });
        }
    },
    
    // 保存自定义任务
    saveCustomTask: async function() {
        // 检查是否正在保存中
        if (this.data.isSaving) return;
        
        // 先检查登录状态
        if (!this.checkLogin()) return;
        
        if (!this.data.newTaskName) return;
        
        // 去除前后空格
        const newTaskName = this.data.newTaskName.trim();
        if (!newTaskName) {
            wx.showToast({
                title: '任务名称不能为空',
                icon: 'none'
            });
            return;
        }
        
        // 检查任务是否已存在（不区分大小写）
        const isTaskExists = this.data.cateArr.some(task => 
            task.text.toLowerCase() === newTaskName.toLowerCase()
        );
        
        if (isTaskExists) {
            wx.showToast({
                title: '该任务已存在',
                icon: 'none'
            });
            return;
        }
        
        // 设置保存状态为true，防止重复提交
        this.setData({
            isSaving: true
        });
        
        // 显示加载提示
        wx.showLoading({
            title: '保存中...',
            mask: true
        });
        
        const newTask = {
            text: newTaskName,
            icon: 'custom'
        };
        
        try {
            const app = getApp();
            if (!app.globalData.isLogin || !app.globalData.openid) {
                wx.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            
            await wx.cloud.callFunction({
                name: 'quickstartFunctions',
                data: {
                    type: 'manageTasks',
                    action: 'addTask',
                    collection: 'user_tasks',
                    task: newTask,
                    openid: app.globalData.openid
                }
            });
            
            // 刷新任务列表
            await this.getUserTasks();
            
            this.setData({ 
                showAddTaskModal: false,
                newTaskName: '', // 清空输入框
                isSaving: false // 重置保存状态
            });
            
            wx.hideLoading();
            wx.showToast({
                title: '添加成功',
                icon: 'success'
            });
        } catch (err) {
            console.error('保存任务失败', err);
            this.setData({
                isSaving: false // 重置保存状态
            });
            wx.hideLoading();
            wx.showToast({
                title: '添加失败',
                icon: 'none'
            });
        }
    },
    // 长按事件处理
    handleLongPress: function(e) {
        if (!this.checkLogin(() => {
            const index = e.currentTarget.dataset.index;
            const task = this.data.cateArr[index];
            
            // 通过 isSystem 属性判断是否是系统任务
            if (task.isSystem) {
                wx.showToast({
                    title: '系统任务不可删除',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            
            // 显示删除确认框
            this.setData({
                showDeleteConfirm: true,
                deleteTaskIndex: index,
                deleteTaskName: task.text,
                deleteTaskId: task._id
            });
        })) return;
    },
    
    // 取消删除
    cancelDelete: function() {
        this.setData({
            showDeleteConfirm: false,
            deleteTaskIndex: null,
            deleteTaskName: '',
            deleteTaskId: null
        });
    },
    // 确认删除
    confirmDelete: async function() {
        this.setData({ showDeleteConfirm: false });
        
        try {
            wx.showLoading({ title: '删除中...' });
            
            const app = getApp();
            if (!app.globalData.isLogin || !app.globalData.openid) {
                wx.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            
            // 使用已存储的任务ID
            await wx.cloud.callFunction({
                name: 'quickstartFunctions',
                data: {
                    type: 'manageTasks',
                    action: 'deleteTask',
                    collection: 'user_tasks',
                    taskId: this.data.deleteTaskId,  // 修复这里
                    openid: app.globalData.openid
                }
            });
            
            // 刷新任务列表
            await this.getUserTasks();
            wx.hideLoading();
            
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
            });
        } catch (err) {
            console.error('删除任务失败', err);
            wx.hideLoading();
            wx.showToast({
                title: '删除失败',
                icon: 'none'
            });
        }
        
        // 重置删除相关数据
        this.setData({
            deleteTaskIndex: null,
            deleteTaskName: '',
            deleteTaskId: null
        });
    },
    checkLogin: function(callback) {
        const app = getApp();
        if (app.globalData.isLogin) {
            callback && callback();
            return true;
        }
        
        // 尝试从本地存储获取
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            app.globalData.userInfo = userInfo;
            app.globalData.isLogin = true;
            callback && callback();
            return true;
        }
        
        // 显示登录提示框
        wx.showModal({
            title: '未登录',
            content: '请先登录以使用完整功能',
            confirmText: '去登录',
            cancelText: '稍后再说',
            success: (res) => {
                if (res.confirm) {
                    wx.navigateTo({
                        url: '/pages/login/login'
                    });
                }
            }
        });
        
        return false;
    },
    
})