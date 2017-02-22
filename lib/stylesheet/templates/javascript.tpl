'use strict';

var SPRITES = {
  <% layout.images.forEach(function (image, idx) { if (image.className.indexOf('-') >= 0) { %>'<%= image.className %>'<% } else { %><%= image.className %><% } %>: { x: <%= image.x %>, y: <%= image.y %>, width: <%= image.width %>, height: <%= image.height %> }<% if (idx !== layout.images.length - 1) { %>,<% } %>
  <% }); %>
};

module.exports = SPRITES;