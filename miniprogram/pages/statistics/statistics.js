// pages/statistics/statistics.js
const app = getApp();
Page({
    data: {
        logs: [],
        stats: {
            totalCount: 0,
            todayCount: 0,
            totalMinutes: 0
        },
        activeTab: 'all',
        dateRange: ['', ''],
        filterCate: '',
        filterCateDisplay: '全部', // 新增：用于显示的分类名称
        filterCateIndex: 0, // 新增：当前选中的分类索引
        loading: true,
        indicatorPosition: 0, // 数值形式的位置
        indicatorPositionWithUnit: "0%", // 带单位的位置
        categories: ['全部'] // 初始包含"全部"选项
    },
    onLoad() {
        this.checkLoginStatus();
        this.getCategories();
    },
    
    onShow() {
        this.checkLoginStatus();
    },
    
    // 检查登录状态
    checkLoginStatus() {
        const app = getApp();
        if (!app.globalData.isLogin) {
            // 尝试从本地存储获取
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
                app.globalData.userInfo = userInfo;
                app.globalData.isLogin = true;
                this.loadLogs();
            } else {
                // 未登录则重置数据
                this.resetData();
            }
        } else {
            this.loadLogs();
        }
    },
    
    // 重置数据为默认状态
    resetData() {
        this.setData({
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
    },
    // 获取所有任务分类
    async getCategories() {
        try {
          const res = await wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'manageTasks',
              action: 'getTasks',
              collection: 'user_cates'
            }
          });
          
          // 确保获取的数据是数组类型
          const categoriesData = Array.isArray(res.result?.data) ? res.result.data : [];
          
          // 确保转换后的结果是数组
          let userCategories = [];
          if (Array.isArray(categoriesData)) {
            userCategories = categoriesData.map(item => {
              return {
                id: item._id,
                name: item.name,
                icon: item.icon || 'default-icon'
              };
            });
          }
          
          // 确保 defaultCates 是数组
          const defaultCates = Array.isArray(this.data.defaultCates) ? this.data.defaultCates : [];
          
          // 合并两个数组
          const categories = [...defaultCates, ...userCategories];
          
          this.setData({
            categories,
            selectedCate: categories.length > 0 ? categories[0].id : ''
          });
        } catch (err) {
          console.error('获取分类失败:', err);
          
          // 确保错误处理中也使用数组
          const defaultCates = Array.isArray(this.data.defaultCates) ? this.data.defaultCates : [];
          
          wx.showToast({
            title: '获取分类失败',
            icon: 'none'
          });
          
          this.setData({
            categories: defaultCates,
            selectedCate: defaultCates.length > 0 ? defaultCates[0].id : ''
          });
        }
      },
    // 加载日志数据
    async loadLogs() {
        const app = getApp();
        if (!app.globalData.isLogin) {
            this.resetData();
            return;
        }
        wx.showLoading({ title: '加载中...' });
        try {
            const res = await wx.cloud.callFunction({
                name: 'quickstartFunctions',
                data: {
                    type: 'getLogs',
                    startDate: this.data.dateRange[0],
                    endDate: this.data.dateRange[1],
                    cate: this.data.filterCate
                }
            });
            if (res.result.code === 0) {
                const now = new Date();
                const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                let totalMinutes = 0;
                let todayCount = 0;
                res.result.data.forEach(log => {
                    totalMinutes += parseInt(log.time);
                    if (log.date.includes(today)) {
                        todayCount++;
                    }
                });
                this.setData({
                    logs: res.result.data,
                    stats: {
                        totalCount: res.result.data.length,
                        todayCount: todayCount,
                        totalMinutes: totalMinutes
                    },
                    loading: false
                });
            } else {
                throw new Error(res.result.message);
            }
            wx.hideLoading();
        } catch (err) {
            console.error('加载日志失败', err);
            wx.hideLoading();
            wx.showToast({
                title: '加载失败: ' + (err.message || '未知错误'),
                icon: 'none'
            });
        }
    },
    // 切换标签
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        if (tab === this.data.activeTab) return;
        // 计算指示器位置 (0, 25, 50, 75)
        let position = 0;
        if (tab === 'today') position = 100;
        else if (tab === 'week') position = 200;
        else if (tab === 'custom') position = 300;
        // 更新带单位的位置
        this.setData({
            activeTab: tab,
            indicatorPosition: position,
            indicatorPositionWithUnit: position + "%"
        });
        // 根据标签过滤数据
        if (tab === 'today') {
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            this.setData({
                dateRange: [todayStr, todayStr],
                filterCate: '',
                filterCateDisplay: '全部',
                filterCateIndex: 0
            }, this.loadLogs);
        } else if (tab === 'week') {
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 6);
            const formatDate = (date) => {
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            };
            this.setData({
                dateRange: [formatDate(weekAgo), formatDate(today)],
                filterCate: '',
                filterCateDisplay: '全部',
                filterCateIndex: 0
            }, this.loadLogs);
        } else {
            this.setData({
                dateRange: ['', ''],
                filterCate: '',
                filterCateDisplay: '全部',
                filterCateIndex: 0
            }, this.loadLogs);
        }
    },
    // 选择日期范围
    bindDateChange(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        
        const newDateRange = [...this.data.dateRange];
        if (field === 'start') {
            newDateRange[0] = value;
        } else {
            newDateRange[1] = value;
        }
        this.setData({
            dateRange: newDateRange,
            activeTab: 'custom'
        }, this.loadLogs);
    },
    // 选择分类过滤
    bindCateChange(e) {
        const index = e.detail.value;
        const selectedCate = this.data.categories[index];
        // 如果选择的是"全部"，则清空过滤条件
        const filterCate = selectedCate === '全部' ? '' : selectedCate;
        this.setData({
            filterCate: filterCate,
            filterCateDisplay: selectedCate,
            filterCateIndex: index,
            activeTab: 'custom'
        }, this.loadLogs);
    },
    // 格式化日期
    formatDate(dateStr) {
        if (!dateStr) return '';
        // 确保日期字符串格式正确
        const dateParts = dateStr.split(' ')[0].split('-');
        if (dateParts.length !== 3) return dateStr;
        return `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
    },
    // 格式化时间
    formatTime(dateStr) {
        if (!dateStr) return '';
        // 如果日期字符串包含时间部分
        if (dateStr.includes(':')) {
            const timeParts = dateStr.split(' ')[1].split(':');
            if (timeParts.length >= 2) {
                return `${timeParts[0]}:${timeParts[1]}`;
            }
        }
        return '';
    }
});