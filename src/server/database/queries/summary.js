module.exports = function (app) {

    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.data = function (params) {

        var filter = ""
        var cd_geocmu = params['cd_geocmu']

        console.log(cd_geocmu)

        if (cd_geocmu == 52) {
            filter = "cd_geocmu <> '52' AND cd_geocmu <> '5300108' "
        }
        else {
            filter = "cd_geocmu = '" + cd_geocmu + "' "
        }

        return [
            {
                id: 'resumed_indicators',
                sql: "with cte as (select (select nome from municipios where cd_geocmu = '" + cd_geocmu + "'), max(confirmados) as confirmados, (select max(suspeitos) as suspeitos from casos group by data order by data desc limit 1) as suspeitos, max(obitos) as obitos from casos where data = (select max(data) from casos) AND " + filter + " group by cd_geocmu) " +
                    "select nome, sum (confirmados) as confirmados, max(suspeitos) as suspeitos, sum(obitos) as obitos from cte group by 1;"
            },
            {
                id: 'last_update',
                sql: "select to_char(max(data), 'DD/MM/YYYY') as data from casos;"
            }
        ]
    }

    return Query;

}