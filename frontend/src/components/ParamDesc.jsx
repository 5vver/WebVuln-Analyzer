import React from 'react';
import {useState, useEffect} from "react";

import {
  Box,
  Icon,
  Slide,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import {QuestionIcon} from '@chakra-ui/icons'

import {useIntl} from 'react-intl';

const desc = {
  verbose: 'This option can be used to set the verbosity level of output messages. ' +
    'There exist seven levels of verbosity. The default level is 1 in which information, warning, error, critical messages and Python tracebacks (if any occur) ' +
    'are displayed. 0: Show only Python tracebacks, error and critical messages.\n' +
    '1: Show also information and warning messages.\n' +
    '2: Show also debug messages.\n' +
    '3: Show also payloads injected.\n' +
    '4: Show also HTTP requests.\n' +
    '5: Show also HTTP responses\' headers.\n' +
    '6: Show also HTTP responses\' page content.' + 'A reasonable level of verbosity to further understand what sqlmap does under the hood is level 2, ' +
    'primarily for the detection phase and the take-over functionalities. Whereas if you want to see the SQL payloads the tools sends, level 3 is your best choice. ' +
    'This level is also recommended to be used when you feed the developers with a potential bug report. ' +
    'In order to further debug potential bugs or unexpected behaviours, we recommend you to set the verbosity to level 4 or above.',
  level: 'This option requires an argument which specifies the level of tests to perform. There are five levels. ' +
    'The default value is 1 where limited number of tests (requests) are performed. Vice versa, ' +
    'level 5 will test verbosely for a much larger number of payloads and boundaries (as in pair of SQL payload prefix and suffix).\n' +
    'Not only this option affects which payload sqlmap tries, but also which injection points are taken in exam: GET and POST parameters are always tested, ' +
    'HTTP Cookie header values are tested from level 2 and HTTP User-Agent/Referer headers\' value is tested from level 3.\n' +
    'All in all, the harder it is to detect a SQL injection, the higher the --level must be set.',
  risk: 'This option requires an argument which specifies the risk of tests to perform. There are three risk values. ' +
    'The default value is 1 which is innocuous for the majority of SQL injection points. Risk value 2 adds to the default level the tests for heavy query ' +
    'time-based SQL injections and value 3 adds also OR-based SQL injection tests.\n' +
    'In some instances, like a SQL injection in an UPDATE statement, injecting an OR-based payload can lead to an update of all the entries of the table, ' +
    'which is certainly not what the attacker wants. For this reason and others this option has been introduced: the user has control over which payloads get tested, ' +
    'the user can arbitrarily choose to use also potentially dangerous ones. As per the previous option, ' +
    'the payloads used by sqlmap are specified in the textual file xml/payloads.xml and you are free to edit and add your owns.',
  randomAgent: 'Use randomly selected HTTP User-Agent header value. By default sqlmap performs HTTP requests with the following User-Agent header value: ' +
    'sqlmap/1.0-dev-xxxxxxx (http://sqlmap.org). Moreover, by providing the switch --random-agent, ' +
    'sqlmap will randomly select a User-Agent from the ./txt/user-agents.txt textual file and use it for all HTTP requests within the session.',
  skipWaf: 'Skip heuristic detection of WAF/IPS protection. By default, sqlmap automatically sends inside one of starting requests a dummy parameter value ' +
    'containing a deliberately "suspicious" SQL injection payload (e.g. ...&foobar=AND 1=1 UNION ALL SELECT 1,2,3,table_name FROM information_schema.tables WHERE 2>1).' +
    ' If target responds differently than for the original request, there is a high possibility that it\'s under some kind of protection.\n' +
    'sqlmap will automatically try to identify backend WAF/IPS protection (if any) so user could do appropriate steps ' +
    '(e.g. use tamper scripts with --tamper). Currently around 80 different products are supported (Airlock, Barracuda WAF, etc.). ' +
    'In case of any problems, user can disable this whole mechanism by providing switch skip-waf.',
  ignoreProxy: 'Ignore system default proxy settings. Switch ignore-proxy should be used when you want to run sqlmap against a ' +
    'target part of a local area network by ignoring the system-wide set HTTP(S) proxy server setting.',
  ignoreRedirects: 'Ignore redirection attempts.',
  ignoreTimeouts: 'Ignore connection timeouts.',
  tor: 'Use Tor anonymity network. If, for any reason, you need to stay anonymous, instead of passing by a single predefined HTTP(S) proxy server, ' +
    'you can configure a Tor client together with Privoxy (or similar) on your machine as explained in Tor installation guides. ' +
    'Then you can use a switch --tor and sqlmap will try to automatically set Tor proxy connection settings.\n' +
    'In case that you want to manually set the type and port of used Tor proxy, you can do it with options --tor-type and --tor-port ' +
    '(e.g. --tor-type=SOCKS5 --tor-port 9050).\n' +
    'You are strongly advised to use --check-tor occasionally to be sure that everything was set up properly. There are cases when Tor bundles ' +
    '(e.g. Vidalia) come misconfigured (or reset previously set configuration) giving you a false sense of anonymity. ' +
    'Using this switch sqlmap will check that everything works as expected by sending a single request to an official Are you using Tor? ' +
    'page before any target requests. In case that check fails, sqlmap will warn you and abruptly exit.',
  checkTor: 'Check to see if Tor is used properly',
  parseErrors: 'Parse and display DBMS error messages from responses. If the web application is configured in debug mode so that it displays ' +
    'in the HTTP responses the back-end database management system error messages, sqlmap can parse and display them for you.\n' +
    'This is useful for debugging purposes like understanding why a certain enumeration or takeover switch does not work' +
    ' - it might be a matter of session user\'s privileges and in this case you would see a DBMS error' +
    ' message along the lines of Access denied for user  SESSION USER.',
  skipStatic: 'Skip testing parameters that not appear to be dynamic',
  keepAlive: 'This switch instructs sqlmap to use persistent HTTP(s) connections.\n' +
    'Note that this switch is incompatible with --proxy switch.',
  hpp: 'HTTP parameter pollution (HPP) is a method for bypassing WAF/IPS protection mechanisms ' +
    '(explained here) that is particularly effective against ASP/IIS and ASP.NET/IIS platforms. ' +
    'If you suspect that the target is behind such protection, you can try to bypass it by using this switch.',
  chunked: 'Use HTTP chunked transfer encoded (POST) requests',
  forceSSL: 'In case that user wants to force usage of SSL/HTTPS requests toward the target, he can use this switch. ' +
    'This can be useful in cases when urls are being collected by using option --crawl or when Burp log is being provided with option -l.',
  batch: 'If you want sqlmap to run as a batch tool, without any user\'s interaction when sqlmap requires it, ' +
    'you can force that by using switch --batch. This will leave sqlmap to go with a default behaviour whenever user\'s input would be required.',
  skipUrlEncode: 'Skip URL encoding of payload data. Depending on parameter placement (e.g. GET) its value could be URL encoded by default. ' +
    'In some cases, back-end web servers do not follow RFC standards and require values to be send ' +
    'in their raw non-encoded form. Use --skip-urlencode in those kind of cases.',
  getAll: 'This switch can be used in situations where user wants to retrieve everything remotely accessible by using a single switch. ' +
    'This is not recommended as it will generate large number of requests retrieving both useful and unuseful data.',
  skipHeuristics: 'Skip heuristic detection of SQLi/XSS vulnerabilities',
  forms: 'Say that you want to test against SQL injections a huge search form or you want to test a ' +
    'login bypass (typically only two input fields named like username and password), you can either pass to sqlmap the request ' +
    'in a request file (-r), set the POSTed data accordingly (--data) or let sqlmap do it for you!\n' +
    'Both of the above mentioned instances, and many others, appear as form and input tags in ' +
    'HTML response bodies and this is where this switch comes into play.\n' +
    'Provide sqlmap with --forms as well as the page where the form can be found as the target URL (-u) ' +
    'and sqlmap will request the target URL for you, parse the forms it has and guide you through to test for SQL injection ' +
    'on those form input fields (parameters) rather than the target URL provided.',
  getDbs: 'When the session user has read access to the system table containing information about ' +
    'available databases, it is possible to enumerate the list of databases.',
  crawlingLevel: 'This option let\'s you specify the depth of crawling.',
  crawl: 'Start crawling from the target webpage for targets and test them.',
  skipDOM: 'You may want to skip DOM XSS scanning while crawling to save you time.',
  blindXSS: 'Using this option while crawling will make XSStrike inject your blind XSS payload ' +
    'defined in core/config.py to be injected to every parameter of every HTML form.',
  fuzzing: 'The fuzzer is meant to test filters and Web Application Firewalls. ' +
    'It is painfully slow because it sends randomly* delay requests and the delay can be up to 30 seconds.',
  sP: 'Fire up burpsuite collaborator and pass the host with -p parameter Or start a simple python http server and wait for the vulnerable ' +
    'param to execute your request. (Highly Recommended)\n' +
    '(This basically helps in exploiting GET requests, for POST you would need to try to exploit it manually)\n' +
    'Payload will get executed with the param at the end of the string so its easy to identify which one is vulnerable. ' +
    'For example: http://72.72.72.72:8000/vulnerableparam',
}

const ParamDesc = (pname, ...props) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const intl = useIntl();

  // const foundParam = Object.keys(desc).find((param) => param === Object.values(pname)[0]);

  return (
    <>
      <Box
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        boxSize={'1.5em'}
        ml={3}
      >
        <Icon boxSize={'1.5em'}
              as={QuestionIcon}
              color={isOpen ? 'teal.200' : 'teal.400'}
              transition='color 0.2s ease-in-out'/>
      </Box>

      <Slide direction='bottom' in={isOpen} style={{ zIndex: 10 }}>
        <Box
          p='40px'
          color='white'
          mt='4'
          bg='teal.400'
          rounded='md'
          shadow='md'
        >
          <Text ml={"1em"}>{intl.formatMessage({ id: Object.values(pname), defaultMessage: 'desc'})}</Text>
        </Box>
      </Slide>
    </>
  );
};

export default ParamDesc;