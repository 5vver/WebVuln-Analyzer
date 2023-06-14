from urllib3.exceptions import NewConnectionError

import startsqlmapapi
import requests
import json
import time

import os
from dotenv import load_dotenv

load_dotenv()

RESTAPI_ADDRESS = os.getenv('SQLMAP_REST_ADDRESS')

def process(options):
    data = ''
    logs = ''
    # Start the sqlmapapi server
    subprocess_handler = startsqlmapapi.start_subprocess()

    headers = {'Content-Type': 'application/json'}

    # Start the new scan task
    time.sleep(10)  # wait for 10 seconds before making the first request

    for _ in range(5):  # try 5 times
        try:
            response = requests.get("http://" + RESTAPI_ADDRESS + ":8775/task/new")
            # if the request is successful, break out of the loop
            break
        except NewConnectionError:
            print("Connection failed. Waiting before trying again.")
            time.sleep(10)  # wait for 10 seconds
    else:
        raise Exception("Could not connect to the server after multiple attempts.")

    # Retrieve the task ID from the response
    task_id = response.json()["taskid"]

    # Start the scan
    response = requests.post("http://" + RESTAPI_ADDRESS + f":8775/scan/{task_id}/start", json=options, headers=headers)

    # Check the response from the API to see if the scan started successfully:
    if response.status_code == 200:
        print("Scan started successfully")
        # logs += "Scan started successfully\n"

    else:
        print("Error starting scan")
        # logs += "Error starting scan\n"
        return

    # Poll for the results of the scan
    while True:
        response = requests.get("http://" + RESTAPI_ADDRESS + f":8775/scan/{task_id}/status")
        status = response.json()["status"]

        if status == "running":
            continue
        elif status == "terminated":
            response = requests.get("http://" + RESTAPI_ADDRESS + f":8775/scan/{task_id}/data")
            results = json.dumps(response.json()["data"], indent=4)
            break
        elif status == "not running":
            print('Error running task')
            # logs += "Error running task\n"
            break

    if ('data' in results != ""):
        print("SQL injection was successful\n")
        # logs += "SQL injection was successful\n"
        response = requests.get("http://" + RESTAPI_ADDRESS + f":8775/scan/{task_id}/log")
        logs += json.dumps(response.json()["log"], indent=4)
        data += results
    else:
        print("Sqli scan has failed")
        # logs += "Sqli scan has failed\n"
        response = requests.get("http://" + RESTAPI_ADDRESS + f":8775/scan/{task_id}/log")
        message = json.dumps(response.json()["log"], indent=4)

        json_list = json.loads(message)
        # print(json_list)

        for json_dict in json_list:
            for value in json_dict.values():
                if isinstance(value, str) and "ERROR" or "CRITICAL" in value:
                    # print(value)
                    logs += value + ' '
        print(logs)

    subprocess_handler.stop()
    return logs, data
