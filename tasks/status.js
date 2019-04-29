var db = require('../configs/database');
var mysql = require('mysql');
var https = require('https');
var dateFormat = require('dateformat');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


const OTRS_COMPLETED_ID = 11;
const TRANSITION_ID = 411;
const AUTH_USERNAME = 'quytruong1991@gmail.com';
const AUTH_PASSWORD = 'dino1234';
var check_change = function () {
    const date = new Date();
    console.log('Every 2 minutes:', date);

    last_status_checked = localStorage.getItem('last_status_checked');
    if (last_status_checked != null) {
        sql_query = mysql.format("SELECT ticket.id, dynamic_field_value.value_text " +
            "FROM ticket JOIN dynamic_field_value ON dynamic_field_value.object_id = ticket.id " +
            "WHERE ticket.change_time > ? AND ticket.ticket_state_id = ?", [dateFormat(last_status_checked, "yyyy-mm-dd h:MM:ss"), OTRS_COMPLETED_ID]);
        console.log(sql_query);
        db.query(sql_query,function(err, rows, fields) {
            if (err) throw err;
            if (rows.length === 0) return;

            var datas = '{"transition":{"id":"' + TRANSITION_ID + '"}}';
            var options = {
                host: 'jira.atlassian.dinovative.com',
                port: 443,
                path: '/rest/api/2/issue/' + rows[0].value_text + '/transitions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + new Buffer(AUTH_USERNAME + ':' + AUTH_PASSWORD).toString('base64')
                }
            };
            var request = https.request(options, function(res) {
                res.on('data', function (response) {
                    console.log('Response: ' + response);
                });
            });
            request.write(datas);
            request.end();

            console.log('[' + last_status_checked + '] Ticket: ' + rows[0].id + ' - JiraKey: ' + rows[0].value_text);
        });
    }

    localStorage.setItem('last_status_checked', date);
};

module.exports  = {
    check_change
};