import d3 from './utils/d3';
import * as topojson from 'topojson';

// import defaultData from './data/default.json';

export default () => ({

  /**
   * Develop your chart in this render function.
   *
   * For more details about this pattern, see Mike Bostock's proposal for
   * reusable charts: https://bost.ocks.org/mike/chart/
   */
  render() {
    /**
     * Set default chart properties in this object. Users can overwrite them
     * by passing a props object through the module's create or update methods.
     */
    let props = {
      size: 50,
      districtNumber: 1,
      districtFill: '#282828',
      stateFill: '#ddd',
      centroidRadius: 2,
      centroidStrokeWidth: 1.5,
      showDot: (stats) => {
        if (stats.area < 10) return true;
        if (stats.extent[0] < 5 || stats.extent[1] < 5) return true;
        return false;
      },
    };

    function chart(selection) {
      selection.each((geoData, i, elements) => {
        /**
         * YOUR D3 CODE HERE 📈 📊 🌐
         */
        const node = elements[i]; // the selected element
        const { size, districtNumber } = props;

        const features = topojson.feature(geoData, {
          type: 'GeometryCollection',
          geometries: geoData.objects['divisions'].geometries,
        });

        const path = d3.geoPath()
          .projection(
            d3.geoMercator()
              .fitSize([size, size], features)
          );

        const districtGeo = geoData.objects.divisions.geometries
          .filter(g =>
            g.properties.district === districtNumber.toString().padStart(2, '0')
          )[0];
        const districtFeature = topojson.feature(geoData, districtGeo);
        const districtStats = {
          area: path.area(districtFeature),
          centroid: path.centroid(districtFeature),
          bounds: path.bounds(districtFeature),
        };
        districtStats.extent = [
          districtStats.bounds[1][0] - districtStats.bounds[0][0], // X extent
          districtStats.bounds[1][1] - districtStats.bounds[0][1], // Y extent
        ];

        const svg = d3.select(node)
          .appendSelect('svg')
          .attr('width', size)
          .attr('height', size);

        const backgroundPaths = svg.selectAll('path.background')
          .data(features.features);

        backgroundPaths.enter().append('path')
          .attr('class', 'background')
          .merge(backgroundPaths)
          .attr('d', path)
          .attr('fill', props.stateFill)
          .attr('stroke', props.stateFill);

        if (props.showDot(districtStats)) {
          svg.appendSelect('circle', 'centroid')
            .attr('fill', 'none')
            .attr('stroke', props.districtFill)
            .attr('stroke-width', props.centroidStrokeWidth)
            .attr('r', props.centroidRadius)
            .attr('cx', districtStats.centroid[0])
            .attr('cy', districtStats.centroid[1]);
          svg.select('path.foreground').remove();
        } else {
          svg.appendSelect('path', 'foreground')
            .attr('d', path(districtFeature))
            .attr('fill', props.districtFill)
            .attr('stroke-width', 0);
          svg.select('circle.centroid').remove();
        }
      });
    }

    /**
     * Getter-setters merge any user-provided properties with the defaults.
     */
    chart.props = (obj) => {
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
  draw() {
    const chart = this.render()
      .props(this._props);

    d3.select(this._selection)
      .datum(this._geoData)
      .call(chart);
  },

  /**
   * The following methods represent the external API of this chart module.
   *
   * See ../preview/App.jsx for an example of how they are used.
   */

  /**
   * Creates the chart initially.
   */
  create(selection, geoData, props = {}) {
    this._selection = selection;
    this._geoData = geoData;
    this._props = props;

    this.draw();
  },

  /**
   * Updates the chart with new data and/or props.
   */
  update(props = {}) {
    this._props = Object.assign({}, this._props, props);
    this.draw();
  },

  /**
   * Resizes the chart.
   */
  resize() {
    this.draw();
  },
});
