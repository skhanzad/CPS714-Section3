// two charts, one of which shows the number of signups per month and the other the number of cancellations per month

import React, { useEffect, useState } from 'react';
import ReactApexChart from "react-apexcharts";
import { getSignupsAndCancellationsData } from '../analytics_service';

export const SignupsCancellationsChart: React.FC = () => {

    const [signupsData, setSignupsData] = useState<(string | number)[][]>([]);
    const [cancellationsData, setCancellationsData] = useState<(string | number)[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const signupsCancellationsDataTemp: any = await getSignupsAndCancellationsData();
                       
            setCancellationsData(signupsCancellationsDataTemp[1] as (string | number)[][]);
            setSignupsData(signupsCancellationsDataTemp[0] as (string | number)[][]);
        };

        fetchData();
    }, []);

    var chartInfoLine1 = {       
        seriesLine1: [{
            name: 'Signups',
            data: signupsData
        }],
        optionsLine1: {
            chart: {
                id: 'fb',
                type: 'line',
                foreColor: '#FFF'
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'datetime',
            },
            title: {
                text: 'New Signups Per Month',
                align: 'left',
                style: {
                    fontSize: '16px',
                }
            },
            stroke: {
                curve: 'smooth',
            },
            colors: ['#008FFB']
        },
    };

    var chartInfoLine2 = {
        seriesLine2: [{
            name: 'Cancellations',
            data: cancellationsData
        }],
        optionsLine2: {
            chart: {
                id: 'tw',
                type: 'line',
                foreColor: '#FFF'
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'datetime',
            },
            title: {
                text: 'Cancellations Per Month',
                align: 'left',
                style: {
                    fontSize: '16px',
                }
            },
            stroke: {
                curve: 'smooth',
            },
            colors: ['#ff0000ff']
        },    
    };

    return (
        <div>
            <div id="chart">
                {
                    (signupsData.length > 0) &&
                    <div>
                        {/* @ts-expect-error */}
                        <ReactApexChart options={chartInfoLine1.optionsLine1} series={chartInfoLine1.seriesLine1} type="line" height={250} />
                    </div>
                }
                {
                    (cancellationsData.length > 0) &&
                    <div>
                        {/* @ts-expect-error */}
                        <ReactApexChart options={chartInfoLine2.optionsLine2} series={chartInfoLine2.seriesLine2} type="line" height={250} />
                    </div>
                }
            </div>
        </div>
    );
}

export default SignupsCancellationsChart;