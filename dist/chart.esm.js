import * as d3 from 'd3';
import { selection } from 'd3';
import { feature } from 'topojson';

selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

selection.prototype.moveToBack = function () {
  return this.each(function () {
    var firstChild = this.parentNode.firstChild;

    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
}; // ... and the important addition. ⬇️⬇️⬇️

/**
 * appendSelect either selects a matching child element of your current
 * selection if one exists or appends that child and selects it. It's useful
 * for writing idempotent chart functions.
 *
 * Use it like this:
 *
 * selection.appendSelect(<element selector>, <class string>)
 *
 * It can be chained like any normal d3 selection:
 *
 * const g = d3.select(myNode).appendSelect('g', 'viz-group');
 * g.appendSelect('rect')
 *   .attr('x', 0); etc.
 *
 * @param  {string} el  String representation of element to be appended/selected.
 * @param  {string} cls Class string (w/out dots) of element to be appended/
 *                      selected. Can pass none or multiple separated by whitespace.
 * @return {object}     d3 selection of child element
 */


selection.prototype.appendSelect = function (el, cls) {
  var selected = cls ? this.select("".concat(el, ".").concat(cls.split(' ').join('.'))) : this.select(el);

  if (selected.size() === 0) {
    return cls ? this.append(el).classed(cls, true) : this.append(el);
  }

  return selected;
};

var chart = (function () {
  return {
    /**
     * Develop your chart in this render function.
     *
     * For more details about this pattern, see Mike Bostock's proposal for
     * reusable charts: https://bost.ocks.org/mike/chart/
     */
    render: function render() {
      /**
       * Set default chart properties in this object. Users can overwrite them
       * by passing a props object through the module's create or update methods.
       */
      var props = {
        size: 50,
        districtNumber: 1,
        districtFill: '#282828',
        stateFill: '#ddd',
        centroidRadius: 2,
        centroidStrokeWidth: 1.5,
        showDot: function showDot(stats) {
          if (stats.area < 10) return true;
          if (stats.extent[0] < 5 || stats.extent[1] < 5) return true;
          return false;
        }
      };

      function chart(selection$$1) {
        selection$$1.each(function (geoData, i, elements) {
          /**
           * YOUR D3 CODE HERE 📈 📊 🌐
           */
          var node = elements[i]; // the selected element

          var _props = props,
              size = _props.size,
              districtNumber = _props.districtNumber;
          var districtID = districtNumber.toString().padStart(2, '0');
          var features = feature(geoData, {
            type: 'GeometryCollection',
            geometries: geoData.objects['divisions'].geometries
          });
          var path = d3.geoPath().projection(d3.geoMercator().fitSize([size, size], features));
          var svg = d3.select(node).appendSelect('svg').attr('width', size).attr('height', size);
          var backgroundPaths = svg.selectAll('path.background').data(features.features);
          backgroundPaths.enter().append('path').attr('class', 'background').merge(backgroundPaths).attr('d', path).attr('fill', districtID === '00' ? props.districtFill : props.stateFill).attr('stroke', districtID === '00' ? props.districtFill : props.stateFill);

          if (districtID === '00') {
            svg.select('circle.centroid').remove();
            svg.select('path.foreground').remove();
            return;
          }

          var districtGeo = geoData.objects.divisions.geometries.filter(function (g) {
            return g.properties.district === districtID;
          })[0];
          var districtFeature = feature(geoData, districtGeo);
          var districtStats = {
            area: path.area(districtFeature),
            centroid: path.centroid(districtFeature),
            bounds: path.bounds(districtFeature)
          };
          districtStats.extent = [districtStats.bounds[1][0] - districtStats.bounds[0][0], // X extent
          districtStats.bounds[1][1] - districtStats.bounds[0][1]];

          if (props.showDot(districtStats)) {
            svg.appendSelect('circle', 'centroid').attr('fill', 'none').attr('stroke', props.districtFill).attr('stroke-width', props.centroidStrokeWidth).attr('r', props.centroidRadius).attr('cx', districtStats.centroid[0]).attr('cy', districtStats.centroid[1]);
            svg.select('path.foreground').remove();
          } else {
            svg.appendSelect('path', 'foreground').attr('d', path(districtFeature)).attr('fill', props.districtFill).attr('stroke-width', 0);
            svg.select('circle.centroid').remove();
          }
        });
      }
      /**
       * Getter-setters merge any user-provided properties with the defaults.
       */


      chart.props = function (obj) {
        if (!obj) return props;
        props = Object.assign(props, obj);
        return chart;
      };

      return chart;
    },

    /**
     * Draws the chart by calling the idempotent render function with
     * a selected element.
     */
    draw: function draw() {
      var chart = this.render().props(this._props);
      d3.select(this._selection).datum(this._geoData).call(chart);
    },

    /**
     * The following methods represent the external API of this chart module.
     *
     * See ../preview/App.jsx for an example of how they are used.
     */

    /**
     * Creates the chart initially.
     */
    create: function create(selection$$1, geoData) {
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      this._selection = selection$$1;
      this._geoData = geoData;
      this._props = props;
      this.draw();
    },

    /**
     * Updates the chart with new data and/or props.
     */
    update: function update() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this._props = Object.assign({}, this._props, props);
      this.draw();
    },

    /**
     * Resizes the chart.
     */
    resize: function resize() {
      this.draw();
    }
  };
});

export default chart;
