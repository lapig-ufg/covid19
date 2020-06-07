const Update = require('./update');
const update = new Update();

update.up(foo);

function foo(dados) {
    console.log(dados);
}
