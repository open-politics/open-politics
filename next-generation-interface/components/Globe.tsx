import { useEffect, useState } from 'react';
import axios from 'axios';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// Import interfaces from the types directory
import { GeoJSONData, MapPolygonTarget } from './types/geojson';

const Home = () => {
  const [geojsonData, setGeojsonData] = useState<GeoJSONData | null>(null);

  useEffect(() => {
    axios.get('/api/globe/')
      .then(response => {
        setGeojsonData(response.data);
        renderGlobe(response.data);
      })
      .catch(error => {
        console.error('Error fetching the geojson data', error);
      });
  }, []);

  const renderGlobe = (data: GeoJSONData) => {
    let root = am5.Root.new("chartdiv");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: "rotateX",
      panY: "rotateY",
      projection: am5map.geoOrthographic(),
      paddingBottom: 20,
      paddingTop: 20,
      paddingLeft: 20,
      paddingRight: 20
    }));


    let polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow
    }));

    polygonSeries.mapPolygons.template.on("active", function(active, target) {
      let countryName = (target as unknown as MapPolygonTarget).dataItem.dataContext.name;
      let articlesHtml = data.features.filter(feature => feature.properties.location === countryName)
        .map(feature => feature.properties.articles.map(article => `
          <div class="article m-2 p-2">
            <h3 class="article-title">${article.headline}</h3>
            <a href="${article.url}" target="_blank">Read more</a>
          </div>
        `).join('')).join('');

      if (articlesHtml) {
        document.getElementById("ArticlesList").innerHTML = articlesHtml;
      }
    });

    let graticuleSeries = chart.series.unshift(
      am5map.GraticuleSeries.new(root, {
        step: 10
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x677935)
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0x677935)
    });

    let previousPolygon: am5map.MapPolygon | null = null;

    polygonSeries.mapPolygons.template.on("active", function(active, target) {
      if (previousPolygon && previousPolygon !== target) {
        previousPolygon.set("active", false);
      }
      if (target.get("active")) {
        let centroid = target.geoCentroid();
        if (centroid) {
          chart.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
          chart.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
        }
        let countryName = (target as unknown as MapPolygonTarget).dataItem.dataContext.name;
        const searchDropdown = document.getElementById("search-dropdown") as HTMLInputElement;
        searchDropdown.value = countryName;
      }
      previousPolygon = target;
    });

    let pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    pointSeries.data.setAll(data.features);

    pointSeries.bullets.push(function() {
      let circle = am5.Circle.new(root, {
        radius: 4,
        fill: am5.color(0xff0000),
        strokeWidth: 0
      });

      return am5.Bullet.new(root, {
        sprite: circle
      });
    });
  };

  return (
    <div>
      <div id="chartdiv" style={{ width: "100%", height: "85vh", position: "relative" }}></div>
      <button id="toggleGlobe" style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1003 }}>
        Toggle Globe
      </button>
      <div id="dashboard" style={{ position: "relative", zIndex: 1002 }}>
        <h2>News from around the world</h2>
        <div id="ArticlesList"></div>
      </div>
    </div>
  );
};

export default Home;
