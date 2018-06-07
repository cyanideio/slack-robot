var utils = require('./lib');
var credentials = require('./config.json');

var success_func = (sheet_data) => {
    console.log(`written ${sheet_data.length} rows`);
}

var fail_func = (err) => {
    console.log(err.message);
}

utils.update(credentials, success_func, fail_func);
