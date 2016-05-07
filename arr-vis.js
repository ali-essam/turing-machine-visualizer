var $ = require('jquery');
var _ = require('underscore');

function ArrayVisualizer(container, arr, initalVal) {
  this.arr = (typeof initalVal != undefined)?_.map(_.range(arr), function () { return initalVal; }):arr;
  this.container = $(container);
  this.rootElem = null;

  var __construct = function(self) {
    self.container.append('<ul id="tape" class="pagination"></ul>');
    self.rootElem = self.container.children().first();
    self.arr.forEach(function(x, i) {
      self.rootElem.append('<li><a href="#" id="' + i + '">' + x +'</a></li>')
    });
  }(this)
}

ArrayVisualizer.prototype.selectElementAt = function (index) {
  this.clearSelection()
  this.rootElem.children().eq(index).addClass('active');
};

ArrayVisualizer.prototype.clearSelection = function () {
  this.rootElem.children().removeClass('active');
};

ArrayVisualizer.prototype.updateArray = function (newArr) {
  this.rootElem.children().each(function(i, elem) {
    $(elem).children().first().text(newArr[i]);
  })
};

ArrayVisualizer.prototype.onClick = function (callback) {
  this.rootElem.children().each(function(i, elem) {
    $(elem).click(function(){
      callback(i);
    });
  })
};

module.exports = {
  'ArrayVisualizer': ArrayVisualizer
}
