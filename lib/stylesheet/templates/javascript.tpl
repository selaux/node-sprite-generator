var SPRITES = {
  <% layout.images.forEach(function (image, idx) { %><%= image.className %>: { x: <%= image.x %>, y: <%= image.y %>, w: <%= image.width %>, h: <%= image.height %> }<% if (idx !== layout.images.length - 1) { %>,<% } %>
  <% }); %>
}

module.exports = SPRITES;