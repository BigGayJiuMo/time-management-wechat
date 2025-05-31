// cloudfunctions/quickstartFunctions/clearUserData/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid } = event;
  
  try {
    const wxContext = cloud.getWXContext();
    
    // 验证操作者身份
    if (openid !== wxContext.OPENID) {
      return {
        code: 403,
        message: '无权操作'
      };
    }
    
    // 删除用户任务数据
    const taskRes = await db.collection('user_tasks').where({
      openid: openid
    }).remove();
    
    // 删除用户日志数据
    const logRes = await db.collection('logs').where({
      openid: openid
    }).remove();
    
    return {
      code: 0,
      message: '用户数据清空成功',
      data: {
        tasksDeleted: taskRes.stats.removed,
        logsDeleted: logRes.stats.removed
      }
    };
  } catch (err) {
    console.error('清空用户数据失败:', err);
    return {
      code: -1,
      message: '清空用户数据失败',
      error: err.message
    };
  }
};