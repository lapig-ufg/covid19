
module.exports = function(app) {
    var Internal = {};
    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.log = function (params) {

        return [
            {
                id: 'log',
                sql:" INSERT INTO logs (time, operation, ip,  user_id) " +
                    " VALUES (NOW(), ${operation}, ${ip},  ${user_id}) RETURNING gid; "
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    };


    return Query;

};