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
    edges: {labelHighlightBold: false},
    nodes: {color:{highlight:{border:'green'}}}
  });

var machine = tl.parse('');

var TAPE_LEFT = -10;
var TAPE_Right = 10;

tp = new arrvis.ArrayVisualizer($('#test'), TAPE_Right - TAPE_LEFT + 1, 0);

tp.onClick(function(i){
  var val = prompt(i + TAPE_LEFT);
  if(val) {
    machine.tape.write(i + TAPE_LEFT, val);
  }
  UpdateTape();
});

$('#btnParse').click(function () {
  tp.selectElementAt(-TAPE_LEFT);
  machine = tl.parse(getTxtTransText());
  console.log(machine);

  setGraphVis(getMachineGraph(machine), visdata);
  UpdateTape();
  enableControls();

  machine.on('step', function(inf) {
    network.selectNodes([machine.currentState], false);
    UpdateTape();
    dvLog("Wrote: " + inf.writtenSymbol + " Moved To State " + inf.state);
    console.log(inf);
    tp.selectElementAt(inf.headPosition + TAPE_LEFT);
  });

  machine.on('error', function(e) {
    dvLog(e.error);
    console.error(e);
  });

});

$('#btnRun').click(function() {
  machine.run(1500);
});

$('#btnStep').click(function() {
  machine.running = true;
  machine.step();
});

$('#btnFinish').click(function() {
  machine.run(0);
});

function getSortedTape(machine, from, to) {
  var mp = machine.tape.readBulk(from,to);
  keys = _.map(_.keys(mp), function(item) {
    return parseInt(item);
  });
  var keys = _.sortBy(keys, function (key) {
    return key;
  });
  return _.map(keys, function(k) { return mp[k] + "" });
}

function setGraphVis(graph, visdata) {
  visdata.nodes.clear();
  visdata.nodes.add(graph.nodes);

  visdata.edges.clear();
  visdata.edges.add(graph.edges);
}

function getMachineGraph(machine) {
  var transitionTable = machine.transitionFunction.transitionTable;
  console.log(transitionTable);;
  var stateNames = _.uniq(_.flatten(_.map(_.values(transitionTable), function(val1) {
    return _.map(_.values(val1), function(val2) {
      return val2.state;
    });
  })));
  stateNames = _.union(stateNames, _.keys(transitionTable));

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
        return;
    }
    transOldVal = currentVal;
    disableControls();
});


function dvLog(txt) {
  $('#logdv').append('<div class="dvrow">' + txt + '</div>')
}

function UpdateTape() {
  var arr = getSortedTape(machine, TAPE_LEFT, TAPE_Right);
  tp.updateArray(arr);
}

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
