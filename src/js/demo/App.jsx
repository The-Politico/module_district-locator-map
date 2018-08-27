import React from 'react';
import ReactDOM from 'react-dom';
import { Sketch } from 'politico-style';
import Chart from './Chart';

import '../../scss/styles.scss';

const { Nav, Footer } = Sketch;

const root = document.getElementById('app');

const geoData = 'https://www.politico.com/election-results/cdn/geography/us-census/cb/500k/2016/states/48/district.json';

const App = (props) => (
  <div>
    <Nav appName='DistrictLocator demo' />
    <Chart geoData={props.geoData} />
    <Footer />
  </div>
);

fetch(geoData)
  .then(r => r.json())
  .then(data => {
    ReactDOM.render(<App geoData={data} />, root);
  });
