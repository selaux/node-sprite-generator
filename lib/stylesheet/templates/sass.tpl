<% layout.images.forEach(function (image) { %>$<%= image.className %>: <%= getCSSValue(-image.x) %> <%= getCSSValue(-image.y) %> <%= getCSSValue(image.width) %> <%= getCSSValue(image.height) %>
<% }); %>@mixin <%= spriteName %>($sprite)
    background-image: url('<%= options.spritePath %>')<% if (options.pixelRatio !== 1) { %>
    background-size: <%= getCSSValue(layout.width) %> <%= getCSSValue(layout.height) %><% } %>
    background-position: nth($sprite, 1) nth($sprite, 2)
    width: nth($sprite, 3)
    height: nth($sprite, 4)
