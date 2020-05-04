
module.exports = function(app) {
    var randomstring = require("randomstring");
    var md5 = require('md5');

    var Internal = {};
    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.counties = function (params) {

        return [
            {
                id: 'counties',
                sql: " SELECT unaccent(nome) as label, cd_geocmu as value FROM municipios WHERE cd_geocmu <> '52' ORDER BY nome ASC; "
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    };

    Query.requireAccess = function (params) {

        let charset = params['cd_geocmu'] + params['nomeresponsavel'] + params['orgao'] + params['telefone'];

        let codigoautorizacao = randomstring.generate({
            length: 10,
            charset: charset.replace(/ /g,'')
        });

        let codigoencrypted = md5(codigoautorizacao);

        return [
            {
                id: 'insert',
                sql: "INSERT INTO usuarios (cd_geocmu, datacadastro, nomeresponsavel, orgao, email, telefone, codigoautorizacao, codigoencrypted, ativo, encaminhado) " +
                    "    VALUES (${cd_geocmu}, NOW(), ${nomeresponsavel},  ${orgao}, ${email}, ${telefone}, '" + codigoautorizacao + "', '" + codigoencrypted + "', FALSE, FALSE) RETURNING gid; "
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    };

    Query.access = function (params) {

        let codigoautorizacao = params['codigoautorizacao'];

        return [
            {
                id: 'access',
                sql: " SELECT gid, mun.cd_geocmu, nomeresponsavel, orgao, email, ativo, nome, estado, uf FROM usuarios as usuario INNER JOIN municipios as mun ON  usuario.cd_geocmu = mun.cd_geocmu WHERE ativo = TRUE AND codigoencrypted = '"+ md5(codigoautorizacao)+"' ; "
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    };


    return Query;

};