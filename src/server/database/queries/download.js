module.exports = function (app) {

    var Internal = {}
    var Query = {};

    Query.confirmados = function (params) {
        return [

            {
                id: 'confirmados',
                sql: "SELECT cd_geocmu, to_char(data, 'DD/MM/YYYY') as data_atualizacao, confirmados, suspeitos, descartados, recuperados, obitos, masculino, feminino, menor10, de15a19, de10a14, de20a29, de30a39, de40a49, de50a59, de60a69, de70a79, maior80, municipio\n" +
                    "\tFROM public.casos order by data;"
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    }

    Query.obitos = function (params) {
        return [

            {
                id: 'obitos',
                sql: "SELECT cd_geocmu, to_char(data, 'DD/MM/YYYY') as data_atualizacao, obitos, masculino, feminino, menor10, de15a19, de10a14, de20a29, de30a39, de40a49, de50a59, de60a69, de70a79, maior80, data_notificacao, municipio\n" +
                    "\tFROM obitos_stats order by data;"
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    }

    return Query;

};
