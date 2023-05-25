import contextlib
import json
import shutil
import time
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

import os
import sys
import re
sys.path.append(os.path.dirname(__file__))

from sqli import process
import xss
import ssrf

app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

queues = []

def sort_queues():
    global queues
    queues = sorted(queues, key=lambda item: int(item["target"].split("_")[1]))

def parse_page_forms(url, cookie=None):
    # Send a GET request to the URL and parse the HTML response
    response = requests.get(url, cookies=cookie)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all input forms in the HTML
    forms = soup.find_all('form')

    # Create an empty dictionary to store the form details
    forms_dict = {}

    for i, form in enumerate(forms):
        # Store the form elements
        form_elements = {}

        # Find all the input elements in the form
        input_elements = form.find_all("input")
        for input_element in input_elements:
            # Get the input element details
            input_name = input_element.get("name")
            input_type = input_element.get("type")
            input_value = input_element.get("value")

            # Add the input element details to the form elements dictionary
            form_elements[input_name] = {
                "type": input_type,
                "value": input_value
            }

        # Find all the text area elements in the form
        text_area_elements = form.find_all("textarea")
        for text_area_element in text_area_elements:
            # Get the text area element details
            text_area_name = text_area_element.get("name")
            text_area_value = text_area_element.text.strip()

            # Add the text area element details to the form elements dictionary
            form_elements[text_area_name] = {
                "type": "textarea",
                "value": text_area_value
            }

        # Find all the text elements in the form
        text_elements = form.find_all("text")
        for text_element in text_elements:
            # Get the text area element details
            text_name = text_element.get("name")
            text_value = text_element.text.strip()

            # Add the text area element details to the form elements dictionary
            form_elements[text_name] = {
                "type": "text",
                "value": text_value
            }

        # Find all the select elements in the form
        select_elements = form.find_all("select")
        for select_element in select_elements:
            # Get the select element details
            select_name = select_element.get("name")
            select_options = []
            for option_element in select_element.find_all("option"):
                select_options.append(option_element.get("value"))

            # Add the select element details to the form elements dictionary
            form_elements[select_name] = {
                "type": "select",
                "options": select_options
            }

        # Find the submit button in the form
        submit_button = form.find("button", type="submit")
        if submit_button:
            submit_button_name = submit_button.get("name")
            submit_button_value = submit_button.get("value")
        else:
            submit_button_name = ""
            submit_button_value = ""

        # Add the form details to the forms dictionary
        forms_dict[f"form-{i + 1}"] = {
            "action": form.get("action"),
            "method": form.get("method"),
            "elements": form_elements,
            "submit_button": {
                "name": submit_button_name,
                "value": submit_button_value
            }
        }

    return forms_dict

def xss_inject_form(url, cookie=None):
    forms = parse_page_forms(url, cookie)

    # pp = pprint.PrettyPrinter(indent=4)
    # pp.pprint(forms)

    inject_l = []

    for i in range(len(forms)):
        injection = ''
        form = forms.get(f'form-{i + 1}')
        if (form.get('method') == 'GET'):
            injection += url + '?'
            form_list = list(form.get('elements').keys())

            # Check submit form
            submit = ''
            if (form.get('submit_button').get('name') != ''):
                submit += '&' + form.get('submit_button').get('name') + '=' + form.get('submit_button').get('value')

            for j in range(len(form_list)):
                if (j != len(form_list) - 1):
                    injection += form_list[j] + '=inj&'
                else:
                    injection += form_list[j] + '=inj' + submit
            inject_l.append({'Method' : 'GET', 'payload' : injection})

        elif (form.get('method') == 'POST'):
            form_list = list(form.get('elements').keys())

            # Check submit form
            submit = ''
            if (form.get('submit_button').get('name') != ''):
                submit += '&' + form.get('submit_button').get('name') + '=' + form.get('submit_button').get('value')

            for j in range(len(form_list)):
                if (j != len(form_list) - 1 and form_list[j] != None):
                    injection += form_list[j] + '=inj&'
                elif (form_list[j] != None):
                    injection += form_list[j] + '=inj' + submit
            inject_l.append({'Method' : 'POST', 'payload' : injection})

    return(inject_l)

@app.get("/start_test")
async def start_test():
    elem = next(x for x in queues if x['status'] == 'Waiting')
    if (elem):
        # Start Scanning Process..
        if (queues):
            elem['status'] = "Processing"

            # Retrieve data from params
            url = elem['data']['url']
            cookie_str = elem['data']['cookies']

            try:
                # Start the sqli tests
                if ('sqli' in elem['data']['testTo']):
                    options = {
                        "url": f"{url}",
                        "verbose": elem['data']['verbose'],
                        "randomAgent": elem['data']['randomAgent'],
                        "headers": None,
                        "authType": None,
                        "authCred": None,
                        "ignoreCode": None,
                        "ignoreProxy": elem['data']['ignoreProxy'],
                        "ignoreRedirects": elem['data']['ignoreRedirects'],
                        "ignoreTimeouts": elem['data']['ignoreTimeouts'],
                        "proxy": None,
                        "proxyCred": None,
                        "tor": elem['data']['tor'],
                        "torPort": None,
                        "torType": "SOCKS5",
                        "checkTor": elem['data']['checkTor'],
                        "delay": 0,
                        "timeout": 30,
                        "retries": 3,
                        "safeUrl": None,
                        "safePost": None,
                        "skipUrlEncode": elem['data']['skipUrlEncode'],
                        "csrfToken": None,
                        "csrfUrl": None,
                        "csrfMethod": None,
                        "csrfRetries": 0,
                        "forceSSL": elem['data']['forceSSL'],
                        "chunked": elem['data']['chunked'],
                        "hpp": elem['data']['hpp'],
                        "keepAlive": elem['data']['keepAlive'],
                        "skipStatic": elem['data']['skipStatic'],
                        "os": None,
                        "prefix": None,
                        "suffix": None,
                        "tamper": None,
                        "batch": elem['data']['batch'],
                        "crawlDepth": None,
                        "getAll": elem['data']['getAll'],
                        "parseErrors": elem['data']['parseErrors'],
                        "skipHeuristics": elem['data']['skipHeuristics'],
                        "skipWaf": elem['data']['skipWaf'],
                        "forms": elem['data']['forms'],
                        # "threads": elem['data']['threads'],
                        "getDbs": elem['data']['getDbs'],
                        "tmpDir": None,
                        "cookie": f"{cookie_str if cookie_str != 'None' else None}",
                        "level": elem['data']['level'],
                        "risk": elem['data']['risk']
                    }

                    logs, data = process(options)

                    logs = json.loads(' '.join(logs.split()))
                    data = json.loads(' '.join(data.split()))

                    elem['results']['sqli']['logs'] = logs
                    elem['results']['sqli']['data'] = data

                # XSS
                if ('xss' in elem['data']['testTo']):
                    if (';' in cookie_str and cookie_str != 'None'):
                        cookie_dict = {key: value for key, value in
                                       (cookie.split('=') for cookie in cookie_str.split('; '))}

                    payload = xss_inject_form(url, cookie_dict if cookie_dict else None)
                    xss_list = []
                    log_file_path = '\data\output.log'
                    with contextlib.suppress(FileNotFoundError):
                        os.remove(os.path.dirname(__file__) + log_file_path)

                    for i in payload:
                        if (str(i.get('Method')) == 'GET'):
                            xss_list.extend(['--url', i.get('payload')])
                            break
                        else:
                            xss_list.extend(['--url', url, '--data', i.get('payload')])
                            break

                    xss_list.extend(['--headers', f'Accept-Language: en-US\nCookie: {cookie_str}'])
                    xss_list.extend(['--crawl']) if elem['data']['crawl'] == 1 else None
                    xss_list.extend(['--blind']) if elem['data']['blindXSS'] == 1 else None
                    xss_list.extend(['--level', elem['data']['crawlingLevel']])
                    xss_list.extend(['--skip'])
                    xss_list.extend(['--file-log-level', 'INFO', '--log-file', 'app\data\output.log'])
                    print(xss_list)

                    # Initialize xss investigation
                    xss.process(xss_list)
                    ansi_escape = re.compile(r'\x1b\[[0-9;]*m')

                    try:
                        file = open(os.path.dirname(__file__) + log_file_path, mode='r')
                        for line in file:
                            line = ansi_escape.sub('', line)
                            elem['results']['xss'] += line
                    finally:
                        file.close()

                # SSRF
                if ('ssrf' in elem['data']['testTo']):
                    opt_l = ['-H', url]
                    opt_l.extend(['-c', f'cooke={cookie_str}'])
                    opt_l.extend(['-p', elem['data']['sPVal']]) if elem['data']['sPVal'] else None
                    print(opt_l)
                    inf, exc = ssrf.process(opt_l)
                    ansi_escape = re.compile(r'\x1b\[[0-9;]*m')
                    if (inf or exc):
                        for l in inf:
                            elem['results']['ssrf'] += ansi_escape.sub('', l)
                        for l in exc:
                            elem['results']['ssrf'] += ansi_escape.sub('', l)
            except Exception as err:
                print("Error on line {}".format(sys.exc_info()[-1].tb_lineno), err)

            if (elem['results']['sqli']['data'] or elem['results']['xss'] or elem['results']['ssrf']):
                elem['status'] = "Done"
            else:
                elem['status'] = "Error"
            print(elem)
            # queues.pop(i)
        else:
            print('list is empty')

@app.get("/queues", tags=["queues"])
async def get_queues() -> dict:
    return { "data": queues }

@app.get("/get_queue/{id}", tags=["queues"])
async def get_queues(id: int) -> dict:
    data = next(x for x in queues if int(x['target'][-1]) == id)
    return {
        "res": data
    }

@app.delete("/queues/{id}", tags=["queues"])
async def delete_queues(id: int) -> dict:
    for q in queues:
        if int(q['target'][-1]) == id:
            queues.remove(q)
            return {
                "data": f"Todo with id {id} has been removed."
            }
    sort_queues()
    return {
        "data": f"Todo with id {id} not found."
    }

@app.post("/add_to_queue", tags=["add_to_queue"])
async def add_to_queue(input_data: dict) -> dict:
    for q in queues[::-1]:
        targ = input_data['target']
        if (targ == q['target']):
            input_data['target'] = 'target_' + str(int(targ[-1]) - 1)
    queues.append(input_data)
    sort_queues()
    print(queues)
    return {
        "data": {"Successfully added to queue"}
    }