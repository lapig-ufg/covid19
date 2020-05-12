const Update = require('./update-new');
const update = new Update();

update.up(foo);

function foo(dados) {
    console.log(dados);
}
