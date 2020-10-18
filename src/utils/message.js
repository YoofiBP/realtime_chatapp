const moment = require('moment');

const generateMessage = (username, message) => {
    return {
        username,
        message,
        createdAt: moment(new Date().getTime()).format("hh:mm A")
    }
}

module.exports = {
    generateMessage
}