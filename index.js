var $ = require("jquery");
var _ = require("underscore");
var tl = require("turing-lang");
var vis = require("vis");

var visdata = {
    nodes: new vis.DataSet(),
    edges: new vis.DataSet()
};
var network = new vis.Network($('#mynetwork')[0], visdata,
  {layout:{hierarchical:{direction: 'LR'}}});
var machine = tl.parse('');

$('#btnRun').click( function () {
  machine = tl.parse(getTxtTransText());
  console.log(machine);
  transitionTable = machine.transitionFunction.transitionTable;

  stateNames = _.uniq(_.flatten(_.map(_.values(transitionTable), function(val1) {
    return _.map(_.values(val1), function(val2) {
      return val2.state;
    });
  })));
  newNodes = _.map(stateNames, function(val) {
    return _.object([['id', val], ['label', val]])
  });
  visdata.nodes.clear();
  visdata.nodes.add(newNodes);

  newEdges = _.flatten(_.map(transitionTable, function(toStates, from) {
    return _.map(toStates, function(val, key) {
      return _.object([
        ['from', from],
        ['to',val.state],
        ['label', key + ' / ' + val.symbol + ',' + (val.direction?'R':'L')],
        ['arrows', 'to']
      ]);
    })
  }), true);
  visdata.edges.clear();
  visdata.edges.add(newEdges);
  machine.on('step', function() {
    console.log(machine.currentState);
  });
  machine.run(1000);
});

function getTxtTransText() {
   return $('#txtTrans').val();
}
//network.setData(data);
// console.log(network);
// console.log(data);
// nodes.update({id:2, color:'red'});
