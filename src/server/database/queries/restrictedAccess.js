
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
                sql: " SELECT nome as label, cd_geocmu as value FROM municipios WHERE cd_geocmu <> '52' AND cd_geocmu <> '5300108' ORDER BY cd_geocmu ASC; "
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
            length: 28,
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
                sql: " SELECT gid, cd_geocmu, nomeresponsavel, orgao, email, ativo FROM usuarios WHERE ativo = TRUE AND codigoencrypted = '"+ md5(codigoautorizacao)+"' ; "
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    };


    return Query;

};