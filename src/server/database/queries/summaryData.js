module.exports = function(app) {

    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.query = function() {
        return "with cte as (select max(confirmados) as confirmados, max(suspeitos) as suspeitos , max(obitos) as obitos from casos where cd_geocmu <> '52' and cd_geocmu <> '5300108' group by cd_geocmu)\n" +
            "select sum (confirmados) as confirmados, max(suspeitos) as suspeitos, sum(obitos) as obitos from cte";
    };

    Query.queryLastUpdate = function() {
        return " select to_char(max(data), 'DD/MM/YYYY')  as data from casos ";
    };

    return Query;

}