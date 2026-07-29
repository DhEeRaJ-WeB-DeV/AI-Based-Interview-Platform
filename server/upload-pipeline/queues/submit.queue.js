const {Queue} = require("bullmq");
const connection = require("../../src/config/redis");

module.exports = new Queue("submit-upload",{
    connection,
});