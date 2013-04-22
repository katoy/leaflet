// Generated by CoffeeScript 1.6.2
(function() {
  var circle_style, classes, container, extent, get_magnitude, get_radius, get_time, map, on_brush, reverse, scale, scheme, scheme_id, timeseries_chart;

  get_time = function(d) {
    return d3.time.format.iso.parse(d.properties.origintime);
  };
  get_magnitude = function(d) {
    return +d.properties.magnitude;
  };
  on_brush = function(brush) {
    var s;

    s = brush.extent();
    return d3.selectAll(".circle").classed("selected", function(d) {
      var time;

      time = get_time(d);
      return s[0] <= time && time <= s[1];
    });
  };
  get_radius = function(d) {
    return d.properties.magnitude * d.properties.magnitude;
  };
  circle_style = function(circles) {
    var extent, scale;

    if (!(extent && scale)) {
      extent = d3.extent(circles.data(), function(d) {
        return d.properties.depth;
      });
      scale = d3.scale.log().domain((reverse ? extent.reverse() : extent)).range(d3.range(classes));
    }
    circles.attr("opacity", 0.4).attr("stroke", scheme[classes - 1]).attr("stroke-width", 1).attr("fill", function(d) {
      return scheme[(scale(d.properties.depth) * 10).toFixed()];
    });
    return circles.on("click", function(d, i) {
      var data, t;

      L.DomEvent.stopPropagation(d3.event);
      t = "<h3><%- id %></h3>" + "<ul>" + "<li>Magnitude: <%- mag %></li>" + "<li>Depth: <%- depth %>km</li>" + "</ul>";
      data = {
        id: d.id,
        mag: d.properties.magnitude,
        depth: d.properties.depth
      };
      return L.popup().setLatLng([d.geometry.coordinates[1], d.geometry.coordinates[0]]).setContent(_.template(t, data)).openOn(map);
    });
  };
  timeseries_chart = function(color) {
    var brush, get_x, get_y, height, margin, no_op, timeseries, width, x, x_label, y, y_label, _brushmove;

    timeseries = function(selection) {
      return selection.each(function(d) {
        var series, x_axis, y_axis;

        x.range([0, width]);
        y.range([height, 0]);
        series = d3.select(this).append("svg").attr("id", "quake-timeseries").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("id", "date-brush").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        x_axis = series.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")");
        y_axis = series.append("g").attr("class", "y axis");
        x_axis.append("text").attr("class", "label").attr("x", width).attr("y", 30).style("text-anchor", "end").text(x_label);
        y_axis.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", -40).attr("dy", ".71em").style("text-anchor", "end").text(y_label);
        series.append("clipPath").attr("id", "clip").append("rect").attr("width", width - 1).attr("height", height - .25).attr("transform", "translate(1,0)");
        series.append("g").attr("class", "brush").call(brush).selectAll("rect").attr("height", height).style("stroke-width", 1).style("stroke", color[color.length - 1]).style("fill", color[2]).attr("opacity", 0.4);
        x.domain(d3.extent(d, get_x));
        x_axis.call(d3.svg.axis().scale(x).orient("bottom"));
        y.domain(d3.extent(d, get_y));
        y_axis.call(d3.svg.axis().scale(y).orient("left"));
        return series.append("g").attr("class", "timeseries").attr("clip-path", "url(#clip)").selectAll("circle").data(d).enter().append("circle").style("stroke", color[color.length - 2]).style("stroke-width", .5).style("fill", color[color.length - 1]).attr("opacity", .4).attr("r", 2).attr("transform", function(d) {
          return "translate(" + x(get_x(d)) + "," + y(get_y(d)) + ")";
        });
      });
    };
    _brushmove = function() {
      return brushmove.call(null, brush);
    };
    no_op = function() {};
    margin = {
      top: 5,
      right: 5,
      bottom: 40,
      left: 45
    };
    width = 960 - margin.left - margin.right;
    height = 80;
    x = d3.time.scale();
    y = d3.scale.linear();
    x_label = "X";
    y_label = "Y";
    brush = d3.svg.brush().x(x).on("brush", _brushmove);
    get_x = no_op;
    get_y = no_op;
    timeseries.x = function(accessor) {
      if (!arguments.length) {
        return get_x;
      }
      get_x = accessor;
      return timeseries;
    };
    timeseries.y = function(accessor) {
      if (!arguments.length) {
        return get_y;
      }
      get_y = accessor;
      return timeseries;
    };
    timeseries.xLabel = function(label) {
      if (!arguments.length) {
        return x_label;
      }
      x_label = label;
      return timeseries;
    };
    timeseries.yLabel = function(label) {
      if (!arguments.length) {
        return y_label;
      }
      y_label = label;
      return timeseries;
    };
    timeseries.brushmove = function(cb) {
      var brushmove;

      if (!arguments.length) {
        return brushmove;
      }
      brushmove = cb;
      return timeseries;
    };
    return timeseries;
  };
  extent = null;
  scale = null;
  classes = 9;
  scheme_id = "BuPu";
  reverse = false;
  scheme = colorbrewer[scheme_id][classes];
  container = L.DomUtil.get("map");
  map = L.map(container).setView([-43.6, 172.3], 10);
  L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {
    attribution: "<a href=\"http://content.stamen.com/dotspotting_toner_cartography_available_for_download\">Stamen Toner</a>, <a href=\"http://www.openstreetmap.org/\">OpenStreetMap</a>, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>",
    maxZoom: 20
  }).addTo(map);
  return d3.json(container.dataset.source, function(collection) {
    var chart;

    L.pointsLayer(collection, {
      radius: get_radius,
      applyStyle: circle_style
    }).addTo(map);
    chart = timeseries_chart(scheme).x(get_time).xLabel("Earthquake origin time").y(get_magnitude).yLabel("Magnitude").brushmove(on_brush);
    return d3.select("body").datum(collection.features).call(chart);
  });
})();
