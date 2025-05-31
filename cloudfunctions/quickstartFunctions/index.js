// cloudfunctions/quickstartFunctions/index.js
const getOpenId = require('./getOpenId/index');
const login = require('./login/index');
const addLogs = require('./addLogs/index');
const manageTasks = require('./manageTasks/index');
const getLogs = require('./getLogs/index');
const deleteUserAccount = require('./deleteUserAccount/index');
const clearUserData = require('./clearUserData/index');
// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'getOpenId':
            return await getOpenId.main(event, context);
        case 'login':
            return await login.main(event, context);
        case 'addLogs':
            return await addLogs.main(event, context);
        case 'manageTasks':
            return await manageTasks.main(event, context);
        case 'getLogs':
            return await getLogs.main(event, context);
        case 'deleteUserAccount':
            return await deleteUserAccount.main(event, context);
        case 'clearUserData':
            return await clearUserData.main(event, context);
        default:
            return {
                code: 400,
                message: '未知请求类型'
            };
    }
};
