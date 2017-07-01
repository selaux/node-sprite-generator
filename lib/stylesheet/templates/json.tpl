{
  <% layout.images.forEach(function (image, idx) { %>"<%= image.className %>": { "x": <%= image.x %>, "y": <%= image.y %>, "width": <%= image.width %>, "height": <%= image.height %> }<% if (idx !== layout.images.length - 1) { %>,<% } %>
  <% }); %>
}