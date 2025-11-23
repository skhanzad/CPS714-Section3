// Service functions for all Reporting & Analytics Charts
// Handler for these API calls is located in backend/data/data_router.py

import axios from "axios";

// Default backend FastAPI address
const api = 'http://localhost:8000'

// membership_chartv2.tsx
export const getMembershipData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/membership_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}

// signups_cancellations_chart.tsx
export const getSignupsAndCancellationsData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/signups_cancellations_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}

// most_popular_chart.tsx
export const getClassPopularityData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/class_popularity_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}

// most_busy_chart.tsx
export const getClassBusyTimeData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/class_busy_time_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}

// hourly_gym_usage_chartv2.tsx (occupancy each hour)
export const getGymOccupancyData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/gym_occupancy_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}

// days_hours_chart.tsx (percentage per hour)
export const getDaysHoursData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/hourly_usage_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}

// active_members.tsx (counter)
export const getNumberActiveMembers = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/number_active_members');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}


// member_types_chart.tsx (pie chart)
export const getMemberTypesData = async () => {
    try {
        const apiData = await axios.get<any[]>(api + '/data/member_types_data');
        return apiData.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return error.message;
        } 
        else {
            console.log("Unexpected Error");
        }
    }
}