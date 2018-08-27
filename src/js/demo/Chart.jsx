import React from 'react';
import debounce from 'lodash/debounce';

import Chart from '../lib/chart.js';

class ChartContainer extends React.Component {
  constructor(props) {
    super(props);
    // Create a new instance of our chart and attach it to this component
    this.chart = new Chart();
  }
  componentDidMount() {
    // Create the chart on mount
    this.createChart(this.props.geoData, { districtNumber: 27 });
    // Add a listener to resize chart with the window
    window.addEventListener('resize', debounce(this.resizeChart, 250));

    const districtNumbers = [...Array(36).keys()];

    districtNumbers.forEach((num, i) => {
      setTimeout(() => {
        this.updateChart({ districtNumber: num + 1 });
      }, (i * 750));
    });
  }

  componentDidUpdate() {
    // Update the chart with the component
    this.updateChart();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', debounce(this.resizeChart, 250));
  }

  createChart = (data = null, props = {}) => {
    this.chart.create('#chart', data, props);
  }

  updateChart = (props = {}) => {
    this.chart.update(props);
  }

  resizeChart = () => {
    this.chart.resize();
  }

  render() {
    return (
      <div style={{padding: '60px', width: '60px', margin: '0 auto'}} >
        <div id='chart' />
      </div>
    );
  }
}

export default ChartContainer;
