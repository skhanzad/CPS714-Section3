// Recorded gym occupancy each hour

import React, { useEffect, useState } from 'react';
import { getGymOccupancyData } from '../analytics_service';
import ReactApexChart from "react-apexcharts";

export const GymUsageChartv2: React.FC = () => {

    const [chartData, setChartData] = useState<(string | number)[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getGymOccupancyData();
            setChartData(data as (string | number)[][]);
        };

        fetchData();
    }, []);
    
  var chartInfo = {
          series: [{
              name: 'Gym Occupancy',
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
                tooltip: {
                    theme: 'dark',
                },
              dataLabels: {
                  enabled: false
              },
              markers: {
                  size: 0,
              },
              title: {
                  text: 'Hourly Gym Occupancy',
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

export default GymUsageChartv2;