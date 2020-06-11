const Update = require('./update');
const update = new Update();

update.up(foo);

function foo(dados) {
    let df = dados.find(element => element.cd_geocmu === 5300108);
    console.log(df);
}
