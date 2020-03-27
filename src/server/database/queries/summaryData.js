module.exports = function(app) {

    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.query = function() {
        return "with cte as (select max(confirmados) as confirmados, max(suspeitos) as suspeitos , max(obitos) as obitos from casos where cd_geocmu <> '52' AND cd_geocmu <> '5300108' group by cd_geocmu)" +
            " select sum (confirmados) as confirmados, sum(suspeitos) as suspeitos, sum(obitos) as obitos from cte ";
    };

    return Query;

}