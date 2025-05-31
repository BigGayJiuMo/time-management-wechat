时间管理助手 - 微信小程序
    时间管理助手是一款基于番茄工作法的专注力提升工具，帮助用户高效管理时间、提升工作效率。通过科学的计时方法、任务管理和数据统计，让时间管理变得简单有效。

功能亮点
    🍅 番茄工作法计时器：自定义专注时长（1-60分钟），可视化倒计时圆环
    📊 数据统计：记录专注历史，生成时间分布图表
    📝 任务管理：创建/删除任务分类，长按删除自定义任务
    👤 用户中心：管理个人资料，查看用户协议与隐私政策
    ⚙️ 个性化设置：屏幕常亮、振动提醒等偏好设置
    ☁️ 云端同步：登录后数据多设备同步，保障数据安全

技术栈
    前端
        微信小程序原生框架
        WXML/WXSS/JavaScript
        Canvas 绘图实现倒计时圆环
        微信开放能力（用户登录、云开发）
    后端
        微信云开发
        云函数（Node.js）
        云数据库（NoSQL）
        云存储
    主要云函数
        login：用户登录与注册
        addLogs：保存专注记录
        getLogs：获取统计日志
        manageTasks：任务管理（增删查）
        deleteUserAccount：账号注销
        clearUserData：数据清空

项目结构
    time-management-wechat/
    ├── cloudfunctions/          # 云函数目录
    │   ├── quickstartFunctions/ # 主要业务逻辑
    │   │   ├── addLogs/         # 添加日志
    │   │   ├── clearUserData/   # 清空用户数据
    │   │   ├── deleteUserAccount/ # 删除账号
    │   │   ├── getLogs/         # 获取日志
    │   │   ├── getOpenId/       # 获取用户openid
    │   │   ├── login/           # 登录功能
    │   │   └── manageTasks/     # 任务管理
    ├── miniprogram/             # 小程序前端代码
    │   ├── images/              # 静态资源
    │   ├── pages/               # 页面组件
    │   │   ├── about/           # 关于页面
    │   │   ├── index/           # 首页（计时器）
    │   │   ├── login/           # 登录页
    │   │   ├── privacypolicy/   # 隐私政策
    │   │   ├── settings/        # 设置页
    │   │   ├── statistics/      # 统计页
    │   │   ├── useragreement/   # 用户协议
    │   │   └── usercenter/      # 用户中心
    │   ├── app.js               # 全局逻辑
    │   ├── app.json             # 全局配置
    │   └── app.wxss             # 全局样式
    ├── README.md                # 项目说明文件
    └── project.config.json      # 项目配置文件

安装与运行
    导入微信开发者工具：
        打开微信开发者工具
        选择"导入项目"，定位到项目目录
        填入你的AppID（或使用测试号）
        勾选"使用云开发"
    初始化云环境：
        在开发者工具中打开云开发控制台
        创建新环境（如time-management-env）
        在app.js中更新环境ID：wx.cloud.init({ env: 'your-env-id' })
    部署云函数：
        右键点击cloudfunctions目录
        选择"同步云函数列表"
        逐个上传并部署云函数
    创建数据库集合：
        集合名称	            描述
        users	            用户信息
        logs	            专注记录
        default_tasks	    系统默认任务
        user_tasks	        用户自定义任务
        user_cates	        用户任务分类
    运行项目：
        点击开发者工具中的"编译"按钮
        首次使用需在登录页面进行微信授权
