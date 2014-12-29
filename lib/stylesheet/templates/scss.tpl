<% layout.images.forEach(function (image) { %>$<%= image.className %>_x: <%= getCSSValue(-image.x) %>;
$<%= image.className %>_y: <%= getCSSValue(-image.y) %>;
$<%= image.className %>_width: <%= getCSSValue(image.width) %>;
$<%= image.className %>_height: <%= getCSSValue(image.height) %>;
$<%= image.className %>: $<%= image.className %>_x $<%= image.className %>_y $<%= image.className %>_width $<%= image.className %>_height;
<% }); %>
@mixin <%= spriteName %>_image {
  background-image: url("<%= options.spritePath %>");
}<% if (options.pixelRatio !== 1) { %>
@mixin <%= spriteName %>_size {
  background-size: <%= getCSSValue(layout.width) %> <%= getCSSValue(layout.height) %>;
}<% } %>
@mixin <%= spriteName %>_position($sprite) {
  background-position: nth($sprite, 1) nth($sprite, 2);
}
@mixin <%= spriteName %>_width($sprite) {
  width: nth($sprite, 3);
}
@mixin <%= spriteName %>_height($sprite) {
  height: nth($sprite, 4);
}
@mixin <%= spriteName %>($sprite) {
  @include <%= spriteName %>_image;<% if (options.pixelRatio !== 1) { %>
  @include <%= spriteName %>_size;<% } %>
  @include <%= spriteName %>_position($sprite);
  @include <%= spriteName %>_width($sprite);
  @include <%= spriteName %>_height($sprite);
}
