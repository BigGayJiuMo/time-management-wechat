// cloudfunctions/quickstartFunctions/addLogs/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
    console.log('[addLogs] 收到请求数据:', event);
    
    try {
        const wxContext = cloud.getWXContext()
        const db = cloud.database()
        
        const result = await db.collection('logs').add({
        data: {
            date: event.date,
            cate: event.cate,
            time: event.time,
            openid: wxContext.OPENID
        }
        });
        
        console.log('[addLogs] 数据保存成功', result);
        return {
        code: 0,
        message: '保存成功',
        data: result
        };
        
    } catch (err) {
        console.error('[addLogs] 数据保存失败', err);
        return {
        code: 500,
        message: '保存失败',
        error: err.message
        };
    }
}