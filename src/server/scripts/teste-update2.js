const Update = require('./update-df');
const update = new Update();

update.up(foo);

function foo(dados) {
    console.log(dados);
}
