const Connection = require('database-js').Connection;
const request = require("request");
const rp = require("request-promise");
const fs = require("fs");
const moment = require("moment");


class Update {
    getConfimadosSES() {

        if (fs.existsSync('confirmados.csv')) {
            try {
                fs.unlinkSync('confirmados.csv');
            } catch (err) {
                console.error(err)
            }
        }

        request('http://datasets.saude.go.gov.br/coronavirus/casos_confirmados.csv', async function (error, response, body) {
            // console.log('body:', body); // Print the HTML for the Google homepage.
            fs.writeFile('confirmados.csv', body.replace(/;/g, ','), function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        });

    }


    getObitosSES() {
        if (fs.existsSync('obitos.csv')) {
            try {
                fs.unlinkSync('obitos.csv');
            } catch (err) {
                console.error(err)
            }
        }


        request('http://datasets.saude.go.gov.br/coronavirus/obitos_confirmados.csv', async function (error, response, body) {
            // console.log('body:', body); // Print the HTML for the Google homepage.
            fs.writeFile('obitos.csv', body.replace(/;/g , ','), async function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        });


    }

    async getSuspeitos() {
        var propertiesObject = { dataAccessId: 'DSBigNumberSuspeitos' };
        let url = 'https://extranet.saude.go.gov.br/pentaho/plugin/cda/api/doQuery?path=/coronavirus/paineis/painel.cda';
        let suspeitos = null;

        try {
            let response = await rp({ url: url, qs: propertiesObject });

            let bd = JSON.parse(response);
            suspeitos = bd.resultset[0][0];
        }catch (e) {
            console.log(e)
        }
        return suspeitos
    }

    async getRecuperados() {
        var propertiesObject = { dataAccessId: 'DSBigNumberRecuperados' };
        let url = 'https://extranet.saude.go.gov.br/pentaho/plugin/cda/api/doQuery?path=/coronavirus/paineis/painel.cda';
        let recuperados = null;

        try {
            let response = await rp({ url: url, qs: propertiesObject });
            let bd = JSON.parse(response);
            recuperados = bd.resultset[0][0];
        }catch (e) {
            console.log(e)
        }
        return recuperados
    }

    async getDadosDF() {

        let df = {};

        try {
            // let response = await rp('https://brasil.io/api/dataset/covid19/caso/data/?format=json&is_last=True&place_type=state');
            //
            // let bd = JSON.parse(response);
            // let ob = this.findElement(bd.results, 'state', 'DF');
            //
            // df.confirmados = ob.confirmed;
            // df.obitos = ob.deaths;

            let response = await rp('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalEstado');

            let bd = JSON.parse(response);
            let ob = this.findElement(bd, '_id', 'DF');
            df.confirmados = ob.casosAcumulado;
            df.obitos = ob.obitosAcumulado;
        }catch (e) {
            console.log(e)
        }
        return df;
    }

    async getCasos() {

        let conn, statement, confirmados;
        let genero = {};
        let faixaEtaria = {};

        try {
            conn = new Connection("csv:///confirmados.csv?headers=true&overwriteOnExecute=true");

            let queryConfimdos = "SELECT"
                + " codigo_ibge as cd_geocmu, municipio, "
                + " COUNT(codigo_ibge) as confirmados, "
                + " data_notificacao "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryConfimdos);
            confirmados = await statement.query();

            let queryFeminino = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(sexo) as qtde "
                + " WHERE sexo = 'FEMININO' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryFeminino);
            genero.fem = await statement.query();


            let queryMasculino = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(sexo) as qtde "
                + " WHERE sexo = 'MASCULINO' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryMasculino);
            genero.mas = await statement.query();


            let queryMeno10 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '< 10 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryMeno10);
            faixaEtaria.menor10 = await statement.query();


            let queryDe10a14 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '10 a 14 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe10a14);
            faixaEtaria.de10a14 = await statement.query();


            let queryDe15a19 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '15 a 19 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe15a19);
            faixaEtaria.de15a19 = await statement.query();


            let queryDe20a29 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '20 a 29 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe20a29);
            faixaEtaria.de20a29 = await statement.query();


            let queryDe30a39 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '30 a 39 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe30a39);
            faixaEtaria.de30a39 = await statement.query();


            let queryDe40a49 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '40 a 49 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe40a49);
            faixaEtaria.de40a49 = await statement.query();


            let queryDe50a59 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '50 a 59 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe50a59);
            faixaEtaria.de50a59 = await statement.query();


            let queryDe60a69 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '60 a 69 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe60a69);
            faixaEtaria.de60a69 = await statement.query();

            let queryDe70a79 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '70 a 79  anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe70a79);
            faixaEtaria.de70a79 = await statement.query();

            let queryMaior80 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '>= 80 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryMaior80);
            faixaEtaria.maior80 = await statement.query();

            return {confirmados, genero, faixaEtaria};

        } catch (reason) {
            console.log(reason);
        } finally {

            if (conn) {
                await conn.close();
            }
        }
    }

    async getObitos() {

        let conn, statement, confirmados;
        let genero = {};
        let faixaEtaria = {};

        try {
            conn = new Connection("csv:///obitos.csv?headers=true&overwriteOnExecute=true");

            let queryConfimdos = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(codigo_ibge) as obitos, "
                + " data_notificacao "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryConfimdos);
            confirmados = await statement.query();

            let queryFeminino = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(sexo) as qtde "
                + " WHERE sexo = 'FEMININO' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryFeminino);
            genero.fem = await statement.query();


            let queryMasculino = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(sexo) as qtde "
                + " WHERE sexo = 'MASCULINO' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryMasculino);
            genero.mas = await statement.query();


            let queryMeno10 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '< 10 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryMeno10);
            faixaEtaria.menor10 = await statement.query();


            let queryDe10a14 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '10 a 14 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe10a14);
            faixaEtaria.de10a14 = await statement.query();


            let queryDe15a19 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '15 a 19 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe15a19);
            faixaEtaria.de15a19 = await statement.query();


            let queryDe20a29 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '20 a 29 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe20a29);
            faixaEtaria.de20a29 = await statement.query();


            let queryDe30a39 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '30 a 39 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe30a39);
            faixaEtaria.de30a39 = await statement.query();


            let queryDe40a49 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '40 a 49 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe40a49);
            faixaEtaria.de40a49 = await statement.query();


            let queryDe50a59 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '50 a 59 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe50a59);
            faixaEtaria.de50a59 = await statement.query();


            let queryDe60a69 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '60 a 69 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe60a69);
            faixaEtaria.de60a69 = await statement.query();

            let queryDe70a79 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '70 a 79  anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryDe70a79);
            faixaEtaria.de70a79 = await statement.query();

            let queryMaior80 = "SELECT"
                + " codigo_ibge as cd_geocmu, "
                + " COUNT(faixa_etaria) as qtde "
                + " WHERE faixa_etaria = '>= 80 anos' "
                + " GROUP BY codigo_ibge ORDER BY codigo_ibge ";

            statement = conn.prepareStatement(queryMaior80);
            faixaEtaria.maior80 = await statement.query();

            return {confirmados, genero, faixaEtaria};
        } catch (reason) {
            console.log(reason);
        } finally {

            if (conn) {
                await conn.close();
            }

        }

    }

    findElement(arr, propName, propValue) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i][propName] == propValue)
                return arr[i];
    }


    async up(callback) {

        (async () => {
            await this.getConfimadosSES();
            await this.getObitosSES();
        })().catch(e => console.error(e.stack))

        let tabela = [];
        let self = this;

        setTimeout(async function () {
            let casos     = await self.getCasos();
            let varObitos = await self.getObitos();

            casos.confirmados.forEach(function (item, indice) {

                let feminino = self.findElement(casos.genero.fem, 'cd_geocmu', item.cd_geocmu);
                let masculino = self.findElement(casos.genero.mas, 'cd_geocmu', item.cd_geocmu);
                let obitos = self.findElement(varObitos.confirmados, 'cd_geocmu', item.cd_geocmu);
                let menor10 = self.findElement(casos.faixaEtaria.menor10, 'cd_geocmu', item.cd_geocmu);
                let de10a14 = self.findElement(casos.faixaEtaria.de10a14, 'cd_geocmu', item.cd_geocmu);
                let de15a19 = self.findElement(casos.faixaEtaria.de15a19, 'cd_geocmu', item.cd_geocmu);
                let de20a29 = self.findElement(casos.faixaEtaria.de20a29, 'cd_geocmu', item.cd_geocmu);
                let de30a39 = self.findElement(casos.faixaEtaria.de30a39, 'cd_geocmu', item.cd_geocmu);
                let de40a49 = self.findElement(casos.faixaEtaria.de40a49, 'cd_geocmu', item.cd_geocmu);
                let de50a59 = self.findElement(casos.faixaEtaria.de50a59, 'cd_geocmu', item.cd_geocmu);
                let de60a69 = self.findElement(casos.faixaEtaria.de60a69, 'cd_geocmu', item.cd_geocmu);
                let de70a79 = self.findElement(casos.faixaEtaria.de70a79, 'cd_geocmu', item.cd_geocmu);
                let maior80 = self.findElement(casos.faixaEtaria.maior80, 'cd_geocmu', item.cd_geocmu);

                let feminino_obitos = self.findElement(varObitos.genero.fem, 'cd_geocmu', item.cd_geocmu);
                let masculino_obitos = self.findElement(varObitos.genero.mas, 'cd_geocmu', item.cd_geocmu);
                let obitos_obitos = self.findElement(varObitos.confirmados, 'cd_geocmu', item.cd_geocmu);
                let menor10_obitos = self.findElement(varObitos.faixaEtaria.menor10, 'cd_geocmu', item.cd_geocmu);
                let de10a14_obitos = self.findElement(varObitos.faixaEtaria.de10a14, 'cd_geocmu', item.cd_geocmu);
                let de15a19_obitos = self.findElement(varObitos.faixaEtaria.de15a19, 'cd_geocmu', item.cd_geocmu);
                let de20a29_obitos = self.findElement(varObitos.faixaEtaria.de20a29, 'cd_geocmu', item.cd_geocmu);
                let de30a39_obitos = self.findElement(varObitos.faixaEtaria.de30a39, 'cd_geocmu', item.cd_geocmu);
                let de40a49_obitos = self.findElement(varObitos.faixaEtaria.de40a49, 'cd_geocmu', item.cd_geocmu);
                let de50a59_obitos = self.findElement(varObitos.faixaEtaria.de50a59, 'cd_geocmu', item.cd_geocmu);
                let de60a69_obitos = self.findElement(varObitos.faixaEtaria.de60a69, 'cd_geocmu', item.cd_geocmu);
                let de70a79_obitos = self.findElement(varObitos.faixaEtaria.de70a79, 'cd_geocmu', item.cd_geocmu);
                let maior80_obitos = self.findElement(varObitos.faixaEtaria.maior80, 'cd_geocmu', item.cd_geocmu);

                tabela.push({
                    cd_geocmu: item.cd_geocmu,
                    data: moment().format('YYYY-MM-DD HH:mm'),
                    confirmados: item.confirmados,
                    suspeitos: 0,
                    recuperados: 0,
                    obitos: obitos == undefined ? 0 : obitos.obitos,
                    feminino: feminino == undefined ? 0 : feminino.qtde,
                    masculino: masculino == undefined ? 0 : masculino.qtde,
                    menor10: menor10 == undefined ? 0 : menor10.qtde,
                    de10a14: de10a14 == undefined ? 0 : de10a14.qtde,
                    de15a19: de15a19 == undefined ? 0 : de15a19.qtde,
                    de20a29: de20a29 == undefined ? 0 : de20a29.qtde,
                    de30a39: de30a39 == undefined ? 0 : de30a39.qtde,
                    de40a49: de40a49 == undefined ? 0 : de40a49.qtde,
                    de50a59: de50a59 == undefined ? 0 : de50a59.qtde,
                    de60a69: de60a69 == undefined ? 0 : de60a69.qtde,
                    de70a79: de70a79 == undefined ? 0 : de70a79.qtde,
                    maior80: maior80 == undefined ? 0 : maior80.qtde,
                    feminino_obitos: feminino_obitos == undefined ? 0 : feminino_obitos.qtde,
                    masculino_obitos: masculino_obitos == undefined ? 0 : masculino_obitos.qtde,
                    menor10_obitos: menor10_obitos == undefined ? 0 : menor10_obitos.qtde,
                    de10a14_obitos: de10a14_obitos == undefined ? 0 : de10a14_obitos.qtde,
                    de15a19_obitos: de15a19_obitos == undefined ? 0 : de15a19_obitos.qtde,
                    de20a29_obitos: de20a29_obitos == undefined ? 0 : de20a29_obitos.qtde,
                    de30a39_obitos: de30a39_obitos == undefined ? 0 : de30a39_obitos.qtde,
                    de40a49_obitos: de40a49_obitos == undefined ? 0 : de40a49_obitos.qtde,
                    de50a59_obitos: de50a59_obitos == undefined ? 0 : de50a59_obitos.qtde,
                    de60a69_obitos: de60a69_obitos == undefined ? 0 : de60a69_obitos.qtde,
                    de70a79_obitos: de70a79_obitos == undefined ? 0 : de70a79_obitos.qtde,
                    maior80_obitos: maior80_obitos == undefined ? 0 : maior80_obitos.qtde,
                    municipio: item.municipio
                });

            });

            let suspeitos = await self.getSuspeitos();
            let recuperados = await self.getRecuperados();
            let df = await self.getDadosDF();

            tabela.push({
                cd_geocmu: 111,
                data: moment().format('YYYY-MM-DD HH:mm'),
                confirmados:0,
                suspeitos: suspeitos,
                recuperados: 0,
                obitos: 0,
                feminino: 0,
                masculino: 0,
                menor10: 0,
                de10a14: 0,
                de15a19: 0,
                de20a29: 0,
                de30a39: 0,
                de40a49: 0,
                de50a59: 0,
                de60a69: 0,
                de70a79: 0,
                maior80: 0,
                feminino_obitos: 0,
                masculino_obitos: 0,
                menor10_obitos: 0,
                de10a14_obitos: 0,
                de15a19_obitos: 0,
                de20a29_obitos: 0,
                de30a39_obitos:0,
                de40a49_obitos: 0,
                de50a59_obitos: 0,
                de60a69_obitos: 0,
                de70a79_obitos: 0,
                maior80_obitos:0,
                municipio: 'SUSPEITOS'
            });

            tabela.push({
                cd_geocmu: 222,
                data: moment().format('YYYY-MM-DD HH:mm'),
                confirmados:0,
                recuperados: recuperados,
                suspeitos: 0,
                obitos: 0,
                feminino: 0,
                masculino: 0,
                menor10: 0,
                de10a14: 0,
                de15a19: 0,
                de20a29: 0,
                de30a39: 0,
                de40a49: 0,
                de50a59: 0,
                de60a69: 0,
                de70a79: 0,
                maior80: 0,
                feminino_obitos: 0,
                masculino_obitos: 0,
                menor10_obitos: 0,
                de10a14_obitos: 0,
                de15a19_obitos: 0,
                de20a29_obitos: 0,
                de30a39_obitos:0,
                de40a49_obitos: 0,
                de50a59_obitos: 0,
                de60a69_obitos: 0,
                de70a79_obitos: 0,
                maior80_obitos:0,
                municipio: 'RECUPERADOS'
            });

            tabela.push({
                cd_geocmu: 5300108,
                data: moment().format('YYYY-MM-DD HH:mm'),
                confirmados: df.confirmados,
                suspeitos: 0,
                recuperados: 0,
                obitos: df.obitos,
                feminino: 0,
                masculino: 0,
                menor10: 0,
                de10a14: 0,
                de15a19: 0,
                de20a29: 0,
                de30a39: 0,
                de40a49: 0,
                de50a59: 0,
                de60a69: 0,
                de70a79: 0,
                maior80: 0,
                feminino_obitos: 0,
                masculino_obitos: 0,
                menor10_obitos: 0,
                de10a14_obitos: 0,
                de15a19_obitos: 0,
                de20a29_obitos: 0,
                de30a39_obitos:0,
                de40a49_obitos: 0,
                de50a59_obitos: 0,
                de60a69_obitos: 0,
                de70a79_obitos: 0,
                maior80_obitos:0,
                municipio: 'BRASÍLIA'
            });

            callback(tabela);

        }, 5000);
    }

}


module.exports = Update;
