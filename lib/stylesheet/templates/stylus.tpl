<% layout.images.forEach(function (image) { %><%= image.className %> = <%= getCSSValue(-image.x) %> <%= getCSSValue(-image.y) %> <%= getCSSValue(image.width) %> <%= getCSSValue(image.height) %>
<% }); %><%= spriteName %>($sprite)
    background-image url('<%= options.spritePath %>')<% if (options.pixelRatio !== 1) { %>
    background-size <%= getCSSValue(layout.width) %> <%= getCSSValue(layout.height) %><% } %>
    background-position $sprite[0] $sprite[1]
    width $sprite[2]
    height $sprite[3]
