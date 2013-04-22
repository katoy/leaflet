(->
  get_time = (d) -> d3.time.format.iso.parse d.properties.origintime

  get_magnitude = (d) -> +d.properties.magnitude

  on_brush = (brush) ->
    s = brush.extent()
    d3.selectAll(".circle").classed "selected", (d) ->
      time = get_time(d)
      s[0] <= time and time <= s[1]

  get_radius = (d) -> d.properties.magnitude * d.properties.magnitude

  circle_style = (circles) ->
    unless extent and scale
      extent = d3.extent(circles.data(), (d) ->
        d.properties.depth
      )
      scale = d3.scale.log().domain((if reverse then extent.reverse() else extent)).range(d3.range(classes))

    circles.attr("opacity", 0.4).attr("stroke", scheme[classes - 1]).attr("stroke-width", 1).attr "fill", (d) ->
      scheme[(scale(d.properties.depth) * 10).toFixed()]

    circles.on "click", (d, i) ->
      L.DomEvent.stopPropagation d3.event
      t = "<h3><%- id %></h3>" + "<ul>" + "<li>Magnitude: <%- mag %></li>" + "<li>Depth: <%- depth %>km</li>" + "</ul>"
      data =
        id: d.id
        mag: d.properties.magnitude
        depth: d.properties.depth

      L.popup().setLatLng([d.geometry.coordinates[1], d.geometry.coordinates[0]]).setContent(_.template(t, data)).openOn map

  timeseries_chart = (color) ->
    timeseries = (selection) ->
      selection.each (d) ->
        x.range [0, width]
        y.range [height, 0]
        series = d3.select(this).append("svg").attr("id", "quake-timeseries").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("id", "date-brush").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        x_axis = series.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")")
        y_axis = series.append("g").attr("class", "y axis")
        x_axis.append("text").attr("class", "label").attr("x", width).attr("y", 30).style("text-anchor", "end").text x_label
        y_axis.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", -40).attr("dy", ".71em").style("text-anchor", "end").text y_label
        series.append("clipPath").attr("id", "clip").append("rect").attr("width", width - 1).attr("height", height - .25).attr "transform", "translate(1,0)"
        series.append("g").attr("class", "brush").call(brush).selectAll("rect").attr("height", height).style("stroke-width", 1).style("stroke", color[color.length - 1]).style("fill", color[2]).attr "opacity", 0.4
        x.domain d3.extent(d, get_x)
        x_axis.call d3.svg.axis().scale(x).orient("bottom")
        y.domain d3.extent(d, get_y)
        y_axis.call d3.svg.axis().scale(y).orient("left")
        series.append("g").attr("class", "timeseries").attr("clip-path", "url(#clip)").selectAll("circle").data(d).enter().append("circle").style("stroke", color[color.length - 2]).style("stroke-width", .5).style("fill", color[color.length - 1]).attr("opacity", .4).attr("r", 2).attr "transform", (d) ->
          "translate(" + x(get_x(d)) + "," + y(get_y(d)) + ")"

    _brushmove = -> brushmove.call null, brush
    no_op = ->
    margin =
      top: 5
      right: 5
      bottom: 40
      left: 45

    width = 960 - margin.left - margin.right
    height = 80
    x = d3.time.scale()
    y = d3.scale.linear()
    x_label = "X"
    y_label = "Y"
    brush = d3.svg.brush().x(x).on("brush", _brushmove)
    get_x = no_op
    get_y = no_op
    timeseries.x = (accessor) ->
      return get_x  unless arguments.length
      get_x = accessor
      timeseries

    timeseries.y = (accessor) ->
      return get_y  unless arguments.length
      get_y = accessor
      timeseries

    timeseries.xLabel = (label) ->
      return x_label  unless arguments.length
      x_label = label
      timeseries

    timeseries.yLabel = (label) ->
      return y_label  unless arguments.length
      y_label = label
      timeseries

    timeseries.brushmove = (cb) ->
      return brushmove  unless arguments.length
      brushmove = cb
      timeseries

    timeseries

  extent = null
  scale = null
  classes = 9
  scheme_id = "BuPu"
  reverse = false
  scheme = colorbrewer[scheme_id][classes]
  container = L.DomUtil.get("map")
  map = L.map(container).setView([-43.6, 172.3], 10)

  L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png",
    attribution: "<a href=\"http://content.stamen.com/dotspotting_toner_cartography_available_for_download\">Stamen Toner</a>, <a href=\"http://www.openstreetmap.org/\">OpenStreetMap</a>, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>"
    maxZoom: 20
  ).addTo map

  d3.json container.dataset.source, (collection) ->
    L.pointsLayer(collection,
      radius: get_radius
      applyStyle: circle_style
    ).addTo map
    chart = timeseries_chart(scheme).x(get_time).xLabel("Earthquake origin time").y(get_magnitude).yLabel("Magnitude").brushmove(on_brush)
    d3.select("body").datum(collection.features).call chart

)()
