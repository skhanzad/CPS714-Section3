// Percentage usage of the gym relative to all the hours in a week 

import React, { useEffect, useState } from 'react';
import { getDaysHoursData } from '../analytics_service';
import ReactApexChart from "react-apexcharts";

export const DaysHoursChart: React.FC = () => {

    const [chartData, setChartData] = useState<(string | number)[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getDaysHoursData();
            setChartData(data as (string | number)[][]);
        };

        fetchData();
    }, []);
    
  var chartInfo = {
          series: [{
              name: 'Gym Occupancy Percentage',
              data: chartData
          }],
          options: {
              chart: {
                type: 'area',
                stacked: false,
                height: 350,
                foreColor: '#FFF',
              zoom: {
                  type: 'x',
                  enabled: true,
                  autoScaleYaxis: true
              },
              toolbar: {
                  autoSelected: 'zoom'
              }
              },
              dataLabels: {
                  enabled: false
              },
              markers: {
                  size: 0,
              },
              title: {
                    text: 'Percentage Hourly Gym Occupancy',
                    align: 'left',
                    style: {
                        fontSize: '16px',
                    }
              },
              fill: {
                  type: 'gradient',
                  gradient: {
                      shadeIntensity: 1,
                      inverseColors: false,
                      opacityFrom: 0.5,
                      opacityTo: 0,
                      stops: [0, 90, 100]
                  },
              },
              xaxis: {
                  type: 'datetime',
                  labels: {
                    format: 'ddd HH:mm',
                  }
              },
              tooltip: {
                  shared: false,
                  theme: 'dark',
                  x: {
                    format: 'ddd HH:mm',
                  }
              },
              stroke: {
                  curve: 'straight',
              },
          },
      };

      return (
          <div>
              <div id="chart">
                  {
                      (chartData.length > 0) &&
                      // @ts-expect-error
                      <ReactApexChart options={chartInfo.options} series={chartInfo.series} type="area" height={350} />
                  }
              </div>
          </div>
      );
  }

export default DaysHoursChart;