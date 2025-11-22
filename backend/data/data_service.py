from collections import Counter
from datetime import datetime, date, timedelta
from .data_repo import *

def getMembershipData():

    data = getMembershipDataFromRepo()

    signup_dates = []
    cancellation_dates = []

    today = date.today()

    for row in data:
        # convert to datetime and then date
        signup_dates.append(datetime.fromisoformat(row['created_at']).date())

        if row['current_period_end'] != None:
            # only count memberships that have ended, not ones that will end
            if (datetime.fromisoformat(row['current_period_end']).date() < (today + timedelta(days = 1))):
                cancellation_dates.append(datetime.fromisoformat(row['current_period_end']).date())

    # sort to get the earliest date
    signup_dates.sort()

    # generate list of dates starting from earliest day to today
    start = signup_dates[0]
    end = today
    date_generated = [start + timedelta(days=x) for x in range(0, (end - start + timedelta(days = 2)).days)]

    signup_dates_dict = {}

    # create signup_dates_dict with 0 values and date strings
    for generated_date in date_generated:
        signup_dates_dict[generated_date.strftime("%Y-%m-%d")] = 0

    cancellation_dates_dict = signup_dates_dict.copy()
    memberships_dict = signup_dates_dict.copy()

    # read through signup_dates and cancellation_dates and increment dictionary
    for signup_date in signup_dates:
        signup_dates_dict[signup_date.strftime("%Y-%m-%d")] = signup_dates_dict[signup_date.strftime("%Y-%m-%d")] + 1

    for cancellation_date in cancellation_dates:
        cancellation_dates_dict[cancellation_date.strftime("%Y-%m-%d")] = cancellation_dates_dict[cancellation_date.strftime("%Y-%m-%d")] + 1

    # turns dictionary into list
    signups_data = [list(item) for item in signup_dates_dict.items()]
    cancellations_data = [list(item) for item in cancellation_dates_dict.items()]
    memberships_data = [list(item) for item in memberships_dict.items()]

    total_memberships = 0

    for row in memberships_data:
        for signup in signups_data:
            if row[0] == signup[0]:
                total_memberships += signup[1]
                row[1] = total_memberships
                signups_data.pop(0)

                # use break because signups_data and cancellations_data were dictionaries where the key is the day and the value is the number of signups / cancellations on that day
                break
        
        for cancellation in cancellations_data:
            if row[0] == cancellation[0]:
                total_memberships -= cancellation[1]
                row[1] = total_memberships
                cancellations_data.pop(0)
                break

    # memberships_data = [
    #     ["2024-01-01", 50],
    #     ["2024-02-01", 75],
    #     ["2024-03-01", 100],
    #     ["2024-04-01", 80],
    #     ["2024-05-01", 120],
    #     ["2024-06-01", 90],
    #     ["2024-07-01", 110],
    # ]

    return memberships_data

def getSignupsAndCancellationsData():

    data = getSignupsAndCancellationsDataFromRepo()

    signup_dates = []
    cancellation_dates = []

    today = date.today()

    for row in data:
        # convert to datetime and then date
        signup_dates.append(datetime.fromisoformat(row['created_at']).date())

        if row['current_period_end'] != None:
            # only count memberships that have ended, not ones that will end
            if (datetime.fromisoformat(row['current_period_end']).date() < (today + timedelta(days = 1))):
                cancellation_dates.append(datetime.fromisoformat(row['current_period_end']).date())

    # sort to get the earliest date
    signup_dates.sort()

    # generate list of dates starting from earliest day to today
    start = signup_dates[0]
    end = today
    date_generated = [start + timedelta(days=x) for x in range(0, (end - start + timedelta(days = 2)).days)]

    signup_dates_dict = {}

    # create signup_dates_dict with 0 values
    for generated_date in date_generated:
        signup_dates_dict[generated_date.strftime("%Y-%m-%d")] = 0

    cancellation_dates_dict = signup_dates_dict.copy()

    # read through signup_dates and cancellation_dates and increment dictionary
    for signup_date in signup_dates:
        signup_dates_dict[signup_date.strftime("%Y-%m-%d")] = signup_dates_dict[signup_date.strftime("%Y-%m-%d")] + 1

    for cancellation_date in cancellation_dates:
        cancellation_dates_dict[cancellation_date.strftime("%Y-%m-%d")] = cancellation_dates_dict[cancellation_date.strftime("%Y-%m-%d")] + 1

    # turns dictionary into list
    signups_data = [list(item) for item in signup_dates_dict.items()]
    cancellations_data = [list(item) for item in cancellation_dates_dict.items()]

    # remove last 3 characters which are the dates so that we only deal with months
    for row in signups_data:
        row[0] = row[0][:-3]

    for row in cancellations_data:
        row[0] = row[0][:-3]

    # combine together all the months 
    counter = Counter()
    for month, number in signups_data:
        counter[month] += number

    # list(counter.items()) is a list of tuples so we convert to a list of lists
    signups_data = [list(t) for t in list(counter.items())]

    counter = Counter()
    for month, number in cancellations_data:
        counter[month] += number

    cancellations_data = [list(t) for t in list(counter.items())]

    # signups_data = [
    #     ["2025-01", 50],
    #     ["2025-02", 75],
    #     ["2025-03", 100],
    #     ["2025-04", 80],
    #     ["2025-05", 120],
    #     ["2025-06", 90],
    #     ["2025-07", 110],
    # ]

    # cancellations_data = [
    #     ["2025-01", 5],
    #     ["2025-02", 7],
    #     ["2025-03", 10],
    #     ["2025-04", 8],
    #     ["2025-05", 12],
    #     ["2025-06", 9],
    #     ["2025-07", 11],
    # ]

    return [signups_data, cancellations_data]

def getClassPopularityData():

    data = getClassNamesFromRepo()

    class_popularity_data = []

    for row in data:
        class_popularity_data.append([row["class_name"], row["total_bookings"]])

    # class_popularity_data = [
    #     ["Yoga", 15],
    #     ["Pilates", 12],
    #     ["Spinning", 20],
    #     ["Zumba", 18],
    #     ["CrossFit", 22],
    #     ["Boxing", 30],
    #     ["HIIT", 25],
    #     ["Yoga", 50],
    # ]

    # combine together all the same class names 
    counter = Counter()
    for class_name, class_count in class_popularity_data:
        counter[class_name] += class_count

    # list(counter.items()) is a list of tuples so we convert to a list of lists
    added_together_data = [list(t) for t in list(counter.items())]

    added_together_data.sort(key=lambda x: x[1], reverse=True)

    top_class_names = []
    top_class_counts = []

    for i in range(len(added_together_data)):
        top_class_names.append(added_together_data[i][0])
        top_class_counts.append(added_together_data[i][1])

    return [top_class_names[:10], top_class_counts[:10]]

def getClassTimesPopularityData():

    data = getClassTimesFromRepo()

    class_popularity_data = []

    for row in data:
        # additional [:-3] to remove seconds from the time
        class_popularity_data.append([row["time"][:-3], row["total_bookings"]])

    # class_popularity_data = [
    #     ["10:00", 20],
    #     ["11:00", 15],
    #     ["12:00", 20],
    #     ["13:00", 18],
    #     ["14:00", 22],
    #     ["15:00", 30],
    #     ["16:00", 25],
    #     ["10:00", 50],
    # ]

    # combine together all the same class names 
    counter = Counter()
    for class_time, class_count in class_popularity_data:
        counter[class_time] += class_count

    # list(counter.items()) is a list of tuples so we convert to a list of lists
    added_together_data = [list(t) for t in list(counter.items())]

    added_together_data.sort(key=lambda x: x[1], reverse=True)

    top_class_times = []
    top_class_counts = []

    for i in range(len(added_together_data)):
        top_class_times.append(added_together_data[i][0])
        top_class_counts.append(added_together_data[i][1])

    return [top_class_times[:10], top_class_counts[:10]]

def getGymOccupancyData():
    occupancy_data = [
        ["2025-01-01 06:00", 20],
        ["2025-01-01 07:00", 35],
        ["2025-01-01 08:00", 50],
        ["2025-01-01 09:00", 40],
        ["2025-01-01 10:00", 60],
        ["2025-01-01 11:00", 55],
        ["2025-01-01 12:00", 70],
        ["2025-01-01 14:00", 60],
        ["2025-01-01 15:00", 55],
        ["2025-01-01 16:00", 70],
        ["2025-01-02 06:00", 20],
        ["2025-01-02 07:00", 35],
        ["2025-01-02 08:00", 50],
        ["2025-01-02 09:00", 40],
        ["2025-01-02 10:00", 60],
        ["2025-01-02 11:00", 55],
        ["2025-01-02 12:00", 70],
        ["2025-01-02 13:00", 70],
        ["2025-01-02 14:00", 60],
        ["2025-01-02 15:00", 55],
        ["2025-01-02 16:00", 70],
    ]

    return occupancy_data

def getHourlyUsageData():
    hourly_usage_data = [
        ["2025-01-01 06:00", 20],
        ["2025-01-01 07:00", 35],
        ["2025-01-01 08:00", 50],
        ["2025-01-01 09:00", 40],
        ["2025-01-01 10:00", 60],
        ["2025-01-01 11:00", 55],
        ["2025-01-01 12:00", 70],
        ["2025-01-01 14:00", 60],
        ["2025-01-01 15:00", 55],
        ["2025-01-01 16:00", 70],
        ["2025-01-02 06:00", 20],
        ["2025-01-02 07:00", 35],
        ["2025-01-02 08:00", 50],
        ["2025-01-02 09:00", 40],
        ["2025-01-02 10:00", 60],
        ["2025-01-02 11:00", 55],
        ["2025-01-02 12:00", 70],
        ["2025-01-02 13:00", 70],
        ["2025-01-02 14:00", 60],
        ["2025-01-02 15:00", 55],
        ["2025-01-02 16:00", 70]
    ]

    format_string = "%Y-%m-%d %H:%M"

    converted_datetime_dates = [datetime.strptime(row[0], format_string) for row in hourly_usage_data]
    converted_days_of_week_and_times = [date.strftime("%A %H:%M") for date in converted_datetime_dates]

    recombined_hourly_usage_data = [[converted_days_of_week_and_times[i], hourly_usage_data[i][1]] for i in range(len(hourly_usage_data))]

    summed_data = {}

    for row in recombined_hourly_usage_data:
        key = row[0]
        value = row[1]
        if key in summed_data:
            summed_data[key] += value
        else:
            summed_data[key] = value

    converted_hourly_usage_data = [[key, value] for key, value in summed_data.items()]
    for row in converted_hourly_usage_data:
        row[0] = row[0].replace("Sunday", "2025-11-02")
        row[0] = row[0].replace("Monday", "2025-11-03")
        row[0] = row[0].replace("Tuesday", "2025-11-04")
        row[0] = row[0].replace("Wednesday", "2025-11-05")
        row[0] = row[0].replace("Thursday", "2025-11-06")
        row[0] = row[0].replace("Friday", "2025-11-07")
        row[0] = row[0].replace("Saturday", "2025-11-08")

    total = sum(row[1] for row in converted_hourly_usage_data)

    # Convert number of people in gym to percentages
    final_hourly_usage_data = [[row[0], round(row[1] / total * 100, 2)] for row in converted_hourly_usage_data]

    return final_hourly_usage_data

def getNumberActiveMembers():
    data = getNumberActiveMembersFromRepo()

    total_members = len(data)

    return total_members
    
def getMemberTypesData():

    data = getMemberTypesDataFromRepo()

    tiers = []

    for row in data:
        tiers.append(row['tier'])

    tier_counts = Counter(tiers)

    tiersList = []
    tiersCountList = []

    for tier, count in tier_counts.items():
        tiersList.append(tier)
        tiersCountList.append(count)

    return [tiersList, tiersCountList]