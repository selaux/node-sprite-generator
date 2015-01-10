<% layout.images.forEach(function (image) { %>$<%= image.className %>-x: <%= getCSSValue(-image.x) %>
$<%= image.className %>-y: <%= getCSSValue(-image.y) %>
$<%= image.className %>-width: <%= getCSSValue(image.width) %>
$<%= image.className %>-height: <%= getCSSValue(image.height) %>
$<%= image.className %>: $<%= image.className %>-x $<%= image.className %>-y $<%= image.className %>-width $<%= image.className %>-height
<% }); %>
@mixin <%= spriteName %>-image
    background-image: url('<%= options.spritePath %>')<% if (options.pixelRatio !== 1) { %>
@mixin <%= spriteName %>-size
    background-size: <%= getCSSValue(layout.width) %> <%= getCSSValue(layout.height) %><% } %>
@mixin <%= spriteName %>-position($sprite)
    background-position: nth($sprite, 1) nth($sprite, 2)
@mixin <%= spriteName %>-width($sprite)
    width: nth($sprite, 3)
@mixin <%= spriteName %>-height($sprite)
    height: nth($sprite, 4)
@mixin <%= spriteName %>($sprite)
    @include <%= spriteName %>-image<% if (options.pixelRatio !== 1) { %>
    @include <%= spriteName %>-size<% } %>
    @include <%= spriteName %>-position($sprite)
    @include <%= spriteName %>-width($sprite)
    @include <%= spriteName %>-height($sprite)
