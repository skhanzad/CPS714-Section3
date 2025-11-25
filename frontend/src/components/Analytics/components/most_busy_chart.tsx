// bar chart showing the classes with the most people enrolled

import React, { useEffect, useState } from 'react';
import ReactApexChart from "react-apexcharts";
import { getClassBusyTimeData } from '../analytics_service';

export const MostBusyTimesChart: React.FC = () => {
    const [popularClassNames, setPopularClassNames] = useState<(string | number)[][]>([]);
    const [popularClassAttendance, setPopularClassAttendance] = useState<(string | number)[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const popularityDataTemp: any = await getClassBusyTimeData();
            setPopularClassNames(popularityDataTemp[0] as (string | number)[][]);
            setPopularClassAttendance(popularityDataTemp[1] as (string | number)[][]);
        };

        fetchData();
    }, []);

    var chartInfo = {
        series: [{
            data: popularClassAttendance
        }],
        options: {
            chart: {
                type: 'bar',
                height: 380,
                foreColor: '#FFF'
            },
            plotOptions: {
            bar: {
                barHeight: '100%',
                distributed: true,
                horizontal: true,
                dataLabels: {
                position: 'bottom'
                },
            }
            },
            colors: ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#2b908f', '#f9a3a4', '#90ee7e',
            '#f48024', '#69d2e7'
            ],
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                style: {
                    colors: ['#fff']
                },
                formatter: function (val: any, opt: any) {
                    return opt.w.globals.labels[opt.dataPointIndex] + " - " + val + " members enrolled"
                },
                offsetX: 0,
                dropShadow: {
                    enabled: true
                }
            },
            stroke: {
            width: 1,
            colors: ['#fff']
            },
            xaxis: {
                categories: popularClassNames,
                labels: {
                }
            },
            yaxis: {
                labels: {
                    show: false
                }
            },
            title: {
                text: 'Most Popular Class Times',
                align: 'center',
                floating: true,
                style: {
                    fontSize: '16px',
                }
            },
            tooltip: {
                theme: 'dark',
            },
            legend: {
                show: false
            }
        },
    }

    return (
        //@ts-expect-error
        <ReactApexChart options={chartInfo.options} series={chartInfo.series} type="bar" height={380} />
    );
};

export default MostBusyTimesChart;