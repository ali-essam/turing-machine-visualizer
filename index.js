var $ = require("jquery");
var _ = require("underscore");
var tl = require("turing-lang");
var vis = require("vis");
var arrvis = require("./arr-vis");

var visdata = {
    nodes: new vis.DataSet(),
    edges: new vis.DataSet()
};
var network = new vis.Network($('#mynetwork')[0], visdata,
  {
    layout: {hierarchical:{direction: 'LR'}},
    edges: {labelHighlightBold: false}
  });
var machine = tl.parse('');

var TAPE_LEFT = -10;
var TAPE_Right = 10;

tp = new arrvis.ArrayVisualizer($('#test'), 20, 0);


function getSortedTape(machine, from, to) {
  var mp = machine.tape.readBulk(from,to);
  var keys = _.sortBy(_.keys(mp), function (key) {
    return key;
  });
  return _.map(keys, function(k) { return mp[k] + "" });
}

$('#btnParse').click(function () {
  machine = tl.parse(getTxtTransText());
  console.log(machine);

  setGraphVis(getMachineGraph(machine), visdata);

  enableControls();

  machine.on('step', function(inf) {
    network.selectNodes([machine.currentState], false);
    var arr = getSortedTape(machine, TAPE_LEFT, TAPE_Right);
    tp.updateArray(arr);
    tp.selectElementAt(inf.headPosition + TAPE_LEFT);
  });

  machine.on('error', function(e) {
    console.error(e);
  });

});

$('#btnRun').click(function() {
  machine.run(1500);
});

$('#btnStep').click(function() {
  machine.step();
});

$('#btnFinish').click(function() {
  machine.run(0);
});

function setGraphVis(graph, visdata) {
  visdata.nodes.clear();
  visdata.nodes.add(graph.nodes);

  visdata.edges.clear();
  visdata.edges.add(graph.edges);
}

function getMachineGraph(machine) {
  var transitionTable = machine.transitionFunction.transitionTable;

  var stateNames = _.uniq(_.flatten(_.map(_.values(transitionTable), function(val1) {
    return _.map(_.values(val1), function(val2) {
      return val2.state;
    });
  })));
  var nodes = _.map(stateNames, function(val) {
    return _.object([['id', val], ['label', val]]);
  });

  var edges = _.flatten(_.map(transitionTable, function(toStates, from) {
    return _.map(toStates, function(val, key) {
      return _.object([
        ['from', from],
        ['to',val.state],
        ['label', key + ' / ' + val.symbol + ',' + (val.direction?'R':'L')],
        ['arrows', 'to']
      ]);
    })
  }), true);

  return {
    nodes: nodes,
    edges: edges
  }
}

var transOldVal = "";
$("#txtTrans").on("change keyup paste", function() {
    var currentVal = $(this).val();
    if(currentVal == transOldVal) {
        return; //check to prevent multiple simultaneous triggers
    }

    transOldVal = currentVal;
    //action to be performed on textarea changed
    disableControls();
});

function getTxtTransText() {
   return $('#txtTrans').val();
}

function disableControls() {
  $('#btnParse').removeClass('disabled');
  $('.btnCtrl').addClass('disabled');
}

function enableControls() {
  $('#btnParse').addClass('disabled');
  $('.btnCtrl').removeClass('disabled');
}
