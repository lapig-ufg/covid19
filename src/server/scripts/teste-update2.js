const Update = require('./update');
const update = new Update();

update.up(foo);

function foo(dados) {
    let recuperados = dados.find(element => element.cd_geocmu === 222);
    let suspeitos = dados.find(element => element.cd_geocmu === 111);
    console.log(recuperados.recuperados, suspeitos.suspeitos );
}
