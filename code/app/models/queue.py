from beanie import Document
from pydantic import BaseModel
from typing import List, Optional, Union

class Data(BaseModel):
    url: str
    cookies: str
    testTo: List[str]
    verbose: Optional[int]
    randomAgent: Optional[str]
    ignoreProxy: Optional[str]
    ignoreRedirects: Optional[str]
    ignoreTimeouts: Optional[str]
    tor: Optional[str]
    checkTor: Optional[str]
    skipUrlEncode: Optional[str]
    forceSSL: Optional[str]
    chunked: Optional[str]
    hpp: Optional[str]
    keepAlive: Optional[str]
    skipStatic: Optional[str]
    batch: Optional[str]
    getAll: Optional[str]
    parseErrors: Optional[str]
    skipHeuristics: Optional[str]
    skipWaf: Optional[str]
    forms: Optional[str]
    getDbs: Optional[str]
    level: Optional[int]
    risk: Optional[int]
    crawl: Optional[str]
    crawlingLevel: Optional[str]
    skipDOM: Optional[str]
    blindXSS: Optional[str]
    fuzzer: Optional[str]
    sPVal: Optional[str]

    # headers: Optional[str] = None
    # authType: Optional[str] = None
    # authCred: Optional[str] = None
    # ignoreCode: Optional[str] = None
    # proxy: Optional[str] = None
    # proxyCred: Optional[str] = None
    # torPort: Optional[str] = None
    # torType: str
    # delay: str
    # timeout: str
    # retries: str
    # safeUrl: Optional[str] = None
    # safePost: Optional[str] = None
    # csrfToken: Optional[str] = None
    # csrfUrl: Optional[str] = None
    # csrfMethod: Optional[str] = None
    # csrfRetries: str
    # os: Optional[str] = None
    # prefix: Optional[str] = None
    # suffix: Optional[str] = None
    # tamper: Optional[str] = None
    # crawlDepth: Optional[str] = None
    # threads: str
    # tmpDir: Optional[str] = None

class Sqli(BaseModel):
    logs: Union[List, str]
    data: Union[List, str]

class Results(BaseModel):
    sqli: Sqli
    xss_res: str
    ssrf_res: str

class Queue(Document):
    target: str
    status: str
    data: Data
    results: Results

    class Settings:
        name = "queues"

    class Config:
        schema_extra = {
            "example": {
                "target": "target_2",
                "status": "Waiting",
                "data": {
                    "url": "https://test.com",
                    "cookies": "Webstorm-6c75f655=d5b036a3-c2e6-4e29-96bd-2569f3f548b8; security_level=0; PHPSESSID=0i0nr4r802cb5up410neb6iohc",
                    "testTo": ["ssrf"],
                    "verbose": 1,
                    "randomAgent": 0,
                    "headers": None,
                    "authType": None,
                    "authCred": None,
                    "ignoreCode": None,
                    "ignoreProxy": 0,
                    "ignoreRedirects": 0,
                    "ignoreTimeouts": 0,
                    "proxy": None,
                    "proxyCred": None,
                    "tor": 0,
                    "torPort": None,
                    "torType": "SOCKS5",
                    "checkTor": 0,
                    "delay": 0,
                    "timeout": 30,
                    "retries": 3,
                    "safeUrl": None,
                    "safePost": None,
                    "skipUrlEncode": 0,
                    "csrfToken": None,
                    "csrfUrl": None,
                    "csrfMethod": None,
                    "csrfRetries": 0,
                    "forceSSL": 0,
                    "chunked": 0,
                    "hpp": 0,
                    "keepAlive": 0,
                    "skipStatic": 0,
                    "os": None,
                    "prefix": None,
                    "suffix": None,
                    "tamper": None,
                    "batch": 1,
                    "crawlDepth": None,
                    "getAll": 0,
                    "parseErrors": 0,
                    "skipHeuristics": 0,
                    "skipWaf": 0,
                    "forms": 1,
                    "threads": 1,
                    "getDbs": 0,
                    "tmpDir": None,
                    "level": 1,
                    "risk": 1,
                    "crawl": 1,
                    "crawlingLevel": '2',
                    "skipDOM": 0,
                    "blindXSS": 0
                },
                "results": {
                    "sqli": {
                        "logs": '',
                        "data": ''
                    },
                    "xss": '',
                    "ssrf": ''
                }
            }
        }


class UpdateBook(BaseModel):
    title: Optional[str]
    author: Optional[str]
    published_year: Optional[int]