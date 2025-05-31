// cloudfunctions/quickstartFunctions/manageTasks/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'getTasks':
        return await handleGetTasks(event);
      case 'addTask':
        return await handleAddTask(event);
      case 'deleteTask':
        return await handleDeleteTask(event);
      default:
        return {
          code: 400,
          message: '未知操作类型'
        };
    }
  } catch (err) {
    console.error('管理任务出错:', err);
    return {
      code: 500,
      message: '服务器错误: ' + err.message
    };
  }
};

// 获取任务
async function handleGetTasks(event) {
  const { collection, openid } = event;
  
  let query = {};
  if (collection === 'user_tasks' && openid) {
    query = { openid };
  }
  
  const res = await db.collection(collection)
    .where(query)
    .get();
  
  return { 
    code: 0, 
    data: res.data 
  };
}

// 添加任务
async function handleAddTask(event) {
  const { collection, task, openid } = event;
  
  if (collection === 'user_tasks' && openid) {
    task.openid = openid;
  }
  
  const res = await db.collection(collection)
    .add({ data: task });
  
  return { 
    code: 0, 
    id: res._id 
  };
}

// 删除任务
async function handleDeleteTask(event) {
  const { collection, taskId, openid } = event;
  
  let query = { _id: taskId };
  if (collection === 'user_tasks' && openid) {
    query.openid = openid;
  }
  
  const res = await db.collection(collection)
    .where(query)
    .remove();
  
  return { 
    code: 0, 
    deleted: res.stats.removed 
  };
}