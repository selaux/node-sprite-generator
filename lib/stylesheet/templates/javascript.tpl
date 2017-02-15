var SPRITES = {
  <% layout.images.forEach(function (image) { %>
    <%= image.className %>: { x: <%= image.x %>, y: <%= image.y %>, w: <%= image.width %>, h: <%= image.height %> },
  <% }); %>
}

module.exports = SPRITES;