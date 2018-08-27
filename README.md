![POLITICO](https://rawgithub.com/The-Politico/src/master/images/logo/badge.png)

# module-district-locator-map

Show a congressional district in miniature. If the district is too small to be visible, display a hollow circle at its centroid.

[Demo.](https://the-politico.github.io/module_district-locator-map/)

A reusable chart module made with ❤️ at POLITICO.


![](preview.gif)

### Install

Install this module from GitHub.

```bash
$ yarn add git+ssh://git@github.com:The-Politico/module_district-locator-map
```

### Use

##### As a module

To use as a module, simply import the chart object:
```javascript
import DistrictLocator from 'module-district-locator-map';
```


The chart object has three methods, one to create the chart, initially, another to update chart elements and one to resize the chart.

The chart module expects to receive topojson data passed on create. See an example of the topojson format the module expects [here](https://www.politico.com/election-results/cdn/geography/us-census/cb/500k/2016/states/48/district.json).

```javascript
const myChart = new DistrictLocator();

// The create method needs a selection string, which will be parent
// to the chart elements, and a data array. You can also provide an
// optional properties object.

// DEFAULT PROPS
const props = {
  districtNumber: 1,
  districtFill: '#282828',
  size: 50,
  stateFill: '#ddd',
  centroidRadius: 2,
  centroidStrokeWidth: 1.5,
  showDot: (stats) => {
    // stats is an object with computed geometric info for the
    // district path expressed in pixels.
    if (stats.area < 10) return true;
    if (stats.extent[0] < 5 || stats.extent[1] < 5) return true;
    return false;
  },
};

myChart.create('#chart', topojson, props);

// The update method takes new props
myChart.update(newProps);

// The resize method can be called at any point to update the chart's size.
myChart.resize();
```

##### In the browser

Include any dependencies, your stylesheet and the minified bundle, which defines a global chart object, `DistrictLocator`.

```html
<!-- head -->
<script src="https://cdn.jsdelivr.net/npm/babel-polyfill@6.26.0/dist/polyfill.min.js"></script>
<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"></script>
<script src="chart.min.js"></script>

<!-- body -->
<div id="DistrictLocator-container"></div>

<script type="text/javascript">
var myChart = new DistrictLocator();

const props = {
  // Some props. See module example for defaults.
};

myChart.create('#DistrictLocator-container', topojson, props);
</script>
```


### Developing the chart

Start developing:
```bash
$ yarn start
```

Build for production:
```bash
$ yarn build
```

Read [DEVELOPING](DEVELOPING.md) for more information on using this chart module pattern.
