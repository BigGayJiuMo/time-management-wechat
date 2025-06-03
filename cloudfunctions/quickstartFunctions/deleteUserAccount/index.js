// cloudfunctions/quickstartFunctions/deleteUserAccount/index.js
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
    
    // 删除用户数据（使用系统_openid字段）
    const userRes = await db.collection('users').where({
      openid: openid
    }).remove();
    
    // 删除用户自定义任务
    const taskRes = await db.collection('user_tasks').where({
      openid: openid
    }).remove();
    
    // 删除用户日志
    const logRes = await db.collection('logs').where({
      openid: openid
    }).remove();
    
    return {
      code: 0,
      message: '账号数据删除成功',
      data: {
        usersDeleted: userRes.stats.removed,
        tasksDeleted: taskRes.stats.removed,
        logsDeleted: logRes.stats.removed
      }
    };
  } catch (err) {
    console.error('删除账号数据失败:', err);
    return {
      code: -1,
      message: '删除账号数据失败',
      error: err.message
    };
  }
};