// cloudfunctions/quickstartFunctions/getLogs/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  console.log('[getLogs] 收到请求数据:', event);
  
  try {
    const wxContext = cloud.getWXContext();
    const db = cloud.database();
    
    // 构建查询条件
    const condition = {
      openid: wxContext.OPENID
    };
    
    // 添加时间范围条件（如果提供）
    if (event.startDate && event.endDate) {
      condition.date = db.command.and(
        db.command.gte(event.startDate),
        db.command.lte(event.endDate + ' 23:59:59') // 包含结束日期的全天
      );
    }
    
    // 添加任务分类条件（如果提供）
    if (event.cate) {
      condition.cate = event.cate;
    }
    
    // 执行查询
    const result = await db.collection('logs')
      .where(condition)
      .orderBy('date', 'desc')
      .get();
    
    console.log('[getLogs] 数据查询成功', result);
    
    return {
      code: 0,
      message: '查询成功',
      data: result.data
    };
    
  } catch (err) {
    console.error('[getLogs] 数据查询失败', err);
    return {
      code: 500,
      message: '查询失败',
      error: err.message
    };
  }
};