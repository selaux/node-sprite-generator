<% layout.images.forEach(function (image) { %>@<%= image.className %>: "<%= getCSSValue(-image.x) %> <%= getCSSValue(-image.y) %> <%= getCSSValue(image.width) %> <%= getCSSValue(image.height) %>";
<% }); %>.<%= spriteName %> (@sprite) {
    background-image: url('<%= options.spritePath %>');<% if (options.pixelRatio !== 1) { %>
    background-size: <%= getCSSValue(layout.width) %> <%= getCSSValue(layout.height) %>;<% } %>
    background-position: ~`@{sprite}.split(' ')[0]` ~`@{sprite}.split(' ')[1]`;
    width: ~`@{sprite}.split(' ')[2]`;
    height: ~`@{sprite}.split(' ')[3]`;
}
