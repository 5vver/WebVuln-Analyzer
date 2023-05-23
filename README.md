# WebVuln Analyzer

WebVuln_Analyzer is a tool for web-application security investigation that combines open source penetration tools, such as: [sqlmap](https://github.com/sqlmapproject/sqlmap), [XSStrike](https://github.com/s0md3v/XSStrike) and [See-SURF](https://github.com/In3tinct/See-SURF). Provides a clear, laconic interface that enhances your interaction with the application. Includes flexible configurable options for each attack vector. The intuitive design offers ease-of-use usage. It also presents detailed results based on thorough scans of web applications, highlighting the seriousness of detected vulnerabilities and providing actionable recommendations (kind of).

Screenshots
----

![Screenshot](https://user-images.githubusercontent.com/68349735/240414436-2b121bf1-2851-4004-8fe2-c9be25374311.png)

You can visit the [collection of screenshots](https://github.com/5vver/WebVuln-Analyzer/wiki/Screenshots) demonstrating some of the features.

Installation
----

Preferably, you can download it by cloning the [Git](https://github.com/5vver/WebVuln-Analyzer) repository:

    git clone https://github.com/5vver/WebVuln-Analyzer.git

WebVuln Analyzer works with [Python](https://www.python.org/download/) version **3.7** and above on any platform also as [Node.js](https://nodejs.org/en/download) version **16.0.0** or above.

Usage
----

To get started first things first run Uvicorn (ASGI Server), from `/code` directory:

    python main.py

Then cd into `/frontend` folder and run React app by typing:

	npm start

Go to localhost:3000 (127.0.0.1:3000) in your browser and you're good to go.

You can find a sample run [here](*).