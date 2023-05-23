import startsqlmapapi
import requests
import json

def process(options):
    data = ''
    logs = ''
    # Start the sqlmapapi server
    subprocess_handler = startsqlmapapi.start_subprocess()

    headers = {'Content-Type': 'application/json'}

    # Start the new scan task
    response = requests.get("http://localhost:8775/task/new")

    # Retrieve the task ID from the response
    task_id = response.json()["taskid"]

    # Start the scan
    response = requests.post(f"http://localhost:8775/scan/{task_id}/start", json=options, headers=headers)

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
        response = requests.get(f"http://localhost:8775/scan/{task_id}/status")
        status = response.json()["status"]

        if status == "running":
            continue
        elif status == "terminated":
            response = requests.get(f"http://localhost:8775/scan/{task_id}/data")
            results = json.dumps(response.json()["data"], indent=4)
            break
        elif status == "not running":
            print('Error running task')
            # logs += "Error running task\n"
            break

    if ('data' in results != ""):
        print("SQL injection was successful\n")
        # logs += "SQL injection was successful\n"
        response = requests.get(f"http://localhost:8775/scan/{task_id}/log")
        logs += json.dumps(response.json()["log"], indent=4)
        data += results
    else:
        print("Sqli scan has failed")
        # logs += "Sqli scan has failed\n"

        response = requests.get(f"http://localhost:8775/scan/{task_id}/log")
        message = json.dumps(response.json()["log"], indent=4)

        json_list = json.loads(message)
        # print(json_list)

        for json_dict in json_list:
            for value in json_dict.values():
                if isinstance(value, str) and "ERROR" or "CRITICAL" in value:
                    # print(value)
                    logs += value + ' '

    subprocess_handler.stop()
    return logs, data
