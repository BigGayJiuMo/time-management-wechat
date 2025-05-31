// cloudfunctions/quickstartFunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  console.log('[收到登录请求]', event);
  
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const openid = wxContext.OPENID;
  
  console.log('[获取到openid]', openid);
  
  try {
    // 检查用户是否已存在（使用openid字段查询）
    const userRecord = await db.collection('users')
      .where({ openid: openid })
      .get();
    
    console.log('[用户查询结果]', userRecord);
    
    // 获取前端传递的用户数据
    const userInfo = event.userInfo || {};
    
    // 准备存储的用户数据
    const userData = {
      nickName: userInfo.nickName || '微信用户',
      avatarUrl: userInfo.avatarUrl || '',
      gender: userInfo.gender || 0,
      lastLogin: db.serverDate(),
      openid: openid
    };
    
    console.log('[准备存储的用户数据]', userData);
    
    if (userRecord.data.length === 0) {
      // 新用户 - 创建记录
      const result = await db.collection('users').add({
        data: {
          ...userData,
          createdAt: db.serverDate(),
          isNewUser: true
        }
      });
      console.log('[新用户创建成功]', result);
    } else {
      // 老用户 - 更新记录
      const userId = userRecord.data[0]._id;
      const result = await db.collection('users').doc(userId).update({
        data: {
          ...userData,
          updatedAt: db.serverDate()
        }
      });
      console.log('[用户信息更新成功]', result);
    }
    
    return { 
      openid: openid,
      userInfo: userData
    };
    
  } catch (err) {
    console.error('[用户记录操作失败]', err);
    return {
      code: 500,
      message: '用户信息保存失败',
      error: err.message
    };
  }
};