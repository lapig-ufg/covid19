module.exports = function (app) {

    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.data = function (params) {

        var filter = ""
        var cd_geocmu = params['cd_geocmu']
        var f = "0"
        if (cd_geocmu == 52) {
            filter = "cd_geocmu <> '52' AND cd_geocmu <> '5300108' "
            f = "222"
        }
        else {
            filter = "cd_geocmu = '" + cd_geocmu + "' "
            f = cd_geocmu
        }

        // sql: "with cte as (select (select nome from municipios where cd_geocmu = '" + cd_geocmu + "'), max(confirmados) as confirmados, (select max(suspeitos) as suspeitos from casos group by data order by data desc limit 1) as suspeitos, max(obitos) as obitos from casos where data = (select max(data) from casos) AND " + filter + " group by cd_geocmu) " +
        // "select nome, sum (confirmados) as confirmados, max(suspeitos) as suspeitos, sum(obitos) as obitos from cte group by 1;"

        return [
            {
                id: 'resumed_indicators',
                sql: "SELECT (select max(recuperados) as recuperados from casos where cd_geocmu = '" + f + "' and data = (select max(data) from casos)), SUM(confirmados) as confirmados, SUM(suspeitos) as suspeitos, SUM(obitos) as obitos FROM casos WHERE data = (select max(data) from casos) AND " + filter + "",
            },
            {
                id: 'last_update',
                sql: "select to_char(max(data), 'DD/MM/YYYY HH24:MI') as data from casos;"
            }
        ]
    }

    return Query;

}
