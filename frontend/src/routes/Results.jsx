import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  Box,
  Stack,
  Heading,
  Text,
  Divider,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  CircularProgress, CircularProgressLabel, Icon, Center, useColorModeValue
} from '@chakra-ui/react'

import {
  CheckCircleIcon,
  SmallCloseIcon
} from '@chakra-ui/icons'

import {FormattedMessage} from 'react-intl';

function flattenData(data) {
  let result = {};

  for (let i in data) {
    if ((typeof data[i]) === 'object' && data[i] !== null) {
      let temp = flattenData(data[i]);
      for (let j in temp) {
        result[i + '.' + j] = temp[j];
      }
    } else {
      result[i] = data[i];
    }
  }

  return result;
}

function parseLine(line) {
  // Extract the timestamp, module, type and message from each line
  const match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) ([\w.]+) - (\w+) - (.*)/);
  if (match) {
    const [, timestamp, module, type, message] = match;
    return { timestamp, module, type, message };
  }
  return null; // For lines that don't match the format
}

function LogTable({ log }) {
  const lines = log.split('\n').map(parseLine).filter(Boolean); // Parse each line and remove null entries

  return (
    <Table>
      <Thead>
        <Tr>
          <Th><FormattedMessage id={"res_xss_td_1"} defaultMessage={'yaruski'} /></Th>
          <Th><FormattedMessage id={"res_xss_td_2"} defaultMessage={'yaruski'} /></Th>
          <Th><FormattedMessage id={"res_xss_td_3"} defaultMessage={'yaruski'} /></Th>
          <Th><FormattedMessage id={"res_xss_td_4"} defaultMessage={'yaruski'} /></Th>
        </Tr>
      </Thead>
      <Tbody>
        {lines.map((line, i) => (
          <Tr key={i}>
            <Td>{line.timestamp}</Td>
            <Td>{line.module}</Td>
            <Td>{line.type}</Td>
            <Td>{line.message}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

function parseMultilineLog(log) {
  const lines = log.split('\n');
  const parsedLines = [];
  let capture = false;
  let currentEntry = null;
  let dashesCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) ([\w.]+) - (\w+) - (.*)/);

    if (match) {
      const [, timestamp, module, type, message] = match;
      if (type === 'GOOD') {
        if (lines[i+1] && lines[i+1].startsWith('----')) {
          // Start capturing
          capture = true;
          dashesCount = 0;
          currentEntry = { timestamp, module, type, message, details: [] };
          parsedLines.push(currentEntry);
        }
      }
    } else if (line.startsWith('----')) {
      dashesCount++;
      if (dashesCount === 2) {
        // Stop capturing after second set of dashes
        capture = false;
        currentEntry = null;
        dashesCount = 0;
      }
    } else if (capture && currentEntry) {
      // Capture the line
      currentEntry.details.push(line);
    }
  }

  return parsedLines.filter(entry => entry.details.length > 0); // Only return entries with details
}

function parseLog(logString) {
  const lines = logString.split('\n');
  const target = lines[0].split(' - ')[1];
  const start = lines[1];
  const infoString = lines.slice(2, lines.length - 1).join(' ');  // join all info lines into one string
  const info = infoString.split('[-]').map(str => str.trim());  // split this string by '[-]' and trim whitespaces
  return {
    target,
    start,
    info
  };
}

function LogsTable({ logString }) {
  const logData = parseLog(logString);

  return (
    <Stack spacing={"2"}>
      <Heading ml={'2'} size={'md'} mt={'1em'}><FormattedMessage id={"res_ssrf_title_1"} defaultMessage={'yaruski'} /></Heading>
      <Table>
        <Thead>
          <Tr>
            <Th><FormattedMessage id={"res_ssrf_td_1"} defaultMessage={'yaruski'} /></Th>
            <Th><FormattedMessage id={"res_ssrf_td_2"} defaultMessage={'yaruski'} /></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{logData.target}</Td>
            <Td>{logData.start}</Td>
          </Tr>
        </Tbody>
      </Table>
      <Heading ml={'2'} size={'md'} mt={'1em'}><FormattedMessage id={"res_ssrf_title_2"} defaultMessage={'yaruski'} /></Heading>
      <Table>
        <Thead>
          <Tr>
            <Th><FormattedMessage id={"res_ssrf_td_3"} defaultMessage={'yaruski'} /></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td whiteSpace="normal" maxW={'250px'} overflow="auto">
              {logData.info.map((infoLine, index) => (
                <div key={index}>{infoLine}</div>
              ))}
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Stack>

  );
}

// Simple overall summary formation
function Summary({data}) {
  const isSqli = !!data.sqli.data;
  let isXss = false;
  let isSsrf = false;

  if (!!data.xss_res) {
    const xLines = data.xss_res.split('\n');
    for (let i = 0; i < xLines.length; i++) {
      const match = xLines[i].match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) ([\w.]+) - (\w+) - (.*)/);
      if (match) {
        const [, , , type, ] = match;
        if (type === 'GOOD') {
          isXss = true;
          break;
        }
      }
    }
  }

  if (!!data.ssrf_res) {
    const sLines = data.ssrf_res.split('\n');
    sLines.forEach(line => {
      if (line.includes('Potential vulnerable')) {
        isSsrf = true;
      }
    })
  }

  const vList = {'XSS': isXss, 'SSRF': isSsrf, 'SQLi': isSqli};
  const vulnRatings = {
    'XSS': 80,
    'SSRF': 85,
    'SQLi': 90
  };
  let prColor = 'green.400'
  const circularTrackColor = useColorModeValue("blackAlpha.100", "whiteAlpha.200")

  return (
    <Stack spacing={'4'} w={'85%'}>
      <Box
        borderColor="black.700"
        borderWidth="1px"
        borderRadius="md"
        p={2}
        w={'100%'}
      >
        <Heading size={'sm'} ml={'1em'} mt={'0.4em'}><FormattedMessage id={"res_title_2"} defaultMessage={'yaruski'} /></Heading>
        <Table>
          <Thead>
            <Tr>
              <Th><FormattedMessage id={"res_summary_table_td_1"} defaultMessage={'yaruski'} /></Th>
              <Th><FormattedMessage id={"res_summary_table_td_2"} defaultMessage={'yaruski'} /></Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(vList).map(function (key, index) {
              return (
                <Tr key={index}>
                  <Td>{key}</Td>
                  <Td>{vList[key] ? (<Icon as={CheckCircleIcon} ml={'0.5em'} boxSize={5} color={'green.500'}/>) : (<Icon as={SmallCloseIcon} ml={'0.5em'} boxSize={5} color={'red.500'}/>)}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
      <Box
        borderColor="black.700"
        borderWidth="1px"
        borderRadius="md"
        p={2}
        w={'100%'}
      >
        <Heading size={'sm'} ml={'1em'} mt={'0.4em'}><FormattedMessage id={"res_title_3"} defaultMessage={'yaruski'} /></Heading>
        <Text ml={'1em'} position={'flex'} ><FormattedMessage id={"res_statistics_val"} defaultMessage={'yaruski'} /> {Object.keys(vList).length}:</Text>
        <Center>
          <CircularProgress trackColor={circularTrackColor} value={(() => {
            let a = 0;
            Object.keys(vList).forEach(key => {
              if (vList[key])
                a++;
            })
            switch (a) {
              case 2:
                prColor = 'yellow.300'
                break
              case 3:
                prColor = 'red.500'
                break
              default:
                prColor = 'green.400'
                break
            }
            return ((a / Object.keys(vList).length) * 100)
          })()} color={prColor} size='150px' thickness='10px'>
            <CircularProgressLabel fontSize={'30px'}>{(() => {
              let a = 0;
              Object.keys(vList).forEach(key => {
                if (vList[key])
                  a++;
              })
              return new String((a / Object.keys(vList).length) * 100).substring(0,4) + '%'
            })()}</CircularProgressLabel>
          </CircularProgress>
        </Center>
        <Divider orientation={'horizontal'} mt={'0.5em'}/>
        <Heading size={'sm'} ml={'1em'} mt={'1em'}><FormattedMessage id={"res_title_4"} defaultMessage={'yaruski'} /></Heading>
        <Text ml={'1em'} position={'flex'} ><FormattedMessage id={"res_seriousness_val"} defaultMessage={'yaruski'} /></Text>
        <Center mt={'1em'}>
          {Object.entries(vList).map(([vuln, present], index) => present ? (
            <Box key={index}>
              <CircularProgress trackColor={circularTrackColor} size='150px' value={vulnRatings[vuln]} color="red.400">
                <CircularProgressLabel fontSize={'30px'}>{vulnRatings[vuln]}%</CircularProgressLabel>
              </CircularProgress>
              <Box>{vuln}</Box>
            </Box>
          ) : null)}
        </Center>
      </Box>
      <Box
        borderColor="black.700"
        borderWidth="1px"
        borderRadius="md"
        p={2}
        w={'100%'}
      >
        <Heading size={'sm'} ml={'1em'} mt={'0.4em'}><FormattedMessage id={"res_title_5"} defaultMessage={'yaruski'} /></Heading>
        <Stack spacing={'2'} m={'0.4em 1em 0 1em'}>
          {(() => {
            let rList = [];
            let check = false;
            Object.values(vList).forEach(val => val && (check = true));
            if (check) {
              Object.keys(vList).forEach(function (key, index) {
                if (vList[key]) {
                  switch (key) {
                    case "SQLi":
                      rList.push(<Text key={index}>
                        <Text as={"b"}>SQL injection</Text> <FormattedMessage id={"res_recommend_sqli"} defaultMessage={'yaruski'} />
                      </Text>)
                      break;
                    case "XSS":
                      rList.push(<Text key={index}>
                        <Text as={"b"}>XSS</Text>:<FormattedMessage id={"res_recommend_xss"} defaultMessage={'yaruski'} />
                      </Text>)
                      break;
                    case "SSRF":
                      rList.push(<Text key={index}>
                        <Text as={"b"}>SSRF</Text> <FormattedMessage id={"res_recommend_ssrf"} defaultMessage={'yaruski'} />
                      </Text>)
                      break;
                    default:
                      break;
                  }
                }
              })
            }
            else
              rList.push(
                <Text key={Object.keys(vList)[0]}><FormattedMessage id={"res_recommend_none"} defaultMessage={'yaruski'} /></Text>)
            return rList
          })()}
        </Stack>
      </Box>
    </Stack>
  )
}

function Results() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [tables, setTables] = useState(false)

  useEffect(() => {
    // Fetch the data using the ID from the URL
    const fetchData = async () => {
      const response = await fetch(`http://localhost:8000/get_queue/${id}`);
      const result = await response.json();
      setData(result);

      const flattened = flattenData(result.res.results.sqli.data);
      const obj = flattened
      const keys = Array.from(new Set(Object.keys(obj).map(key => key.split('.')[0])));
      const tables = keys.map(key => {
        // Extract the properties for this key
        const properties = Object.keys(obj).filter(prop => prop.startsWith(key + '.'));

        return (
          <Box
            borderColor="black.700"
            borderWidth="1px"
            borderRadius="md"
            p={2}
            key={key}
          >
            <Heading size={'sm'} ml={'1em'} mt={'1em'}>{`Key_${key}`}</Heading>
            <Table>
              <Thead>
              <Tr>
                <Th><FormattedMessage id={"res_sqli_td_1"} defaultMessage={'yaruski'}/></Th>
                <Th><FormattedMessage id={"res_sqli_td_2"} defaultMessage={'yaruski'}/></Th>
              </Tr>
              </Thead>
              <Tbody>
                {properties.map(prop => (
                  obj[prop] ? (
                    <Tr key={prop}>
                      <Td>{prop}</Td>
                      <Td whiteSpace="pre-line" maxWidth="250px" overflow="auto">
                        <Text>
                          {obj[prop]}
                        </Text>
                      </Td>
                    </Tr>
                  ) : <Tr key={prop}></Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        );
      });
      setTables(tables)
    };

    fetchData();
  }, [id]);

  return (
    <Stack spacing={4} align={'center'} marginTop={'2.5em'} mb={'2em'}>
      <Box shadow={'md'} w={'85%'} borderWidth='1px' borderRadius='lg' overflow='hidden'>
        <Tabs position="relative" variant="unstyled" colorScheme='teal' isLazy>
          <Heading size={'sm'} ml={'1em'} mt={'0.8em'}><FormattedMessage id={"res_title_1"} defaultMessage={'yaruski'} /></Heading>
          <TabList>
            <Tab><FormattedMessage id={"res_tab_1"} defaultMessage={'yaruski'} /></Tab>
            <Tab><FormattedMessage id={"res_tab_2"} defaultMessage={'yaruski'} /></Tab>
            <Tab><FormattedMessage id={"res_tab_3"} defaultMessage={'yaruski'} /></Tab>
            <Tab><FormattedMessage id={"res_tab_4"} defaultMessage={'yaruski'} /></Tab>
          </TabList>
          <TabIndicator
            mt="-1.5px"
            height="2px"
            bg="teal.500"
            borderRadius="1px"
          />
          {data != '' ? (
            <TabPanels>
              <TabPanel>
                <Stack ml={'2'}>
                  <Text><Text as={'b'}><FormattedMessage id={"res_info_1"} defaultMessage={'yaruski'} /></Text> {data.res.target}</Text>
                  <Text><Text as={'b'}><FormattedMessage id={"res_info_2"} defaultMessage={'yaruski'} /></Text> {data.res.status}</Text>
                  <Text><Text as={'b'}><FormattedMessage id={"res_info_3"} defaultMessage={'yaruski'} /></Text> {data.res.data.url}</Text>
                </Stack>
              </TabPanel>
              {/* SQLI */}
              <TabPanel>
                <Heading ml={'2'} size={'md'} mt={'1em'} mb={'1em'}><FormattedMessage id={"res_sqli_title_1"} defaultMessage={'yaruski'} /></Heading>
                <Box
                  borderColor="black.700"
                  borderWidth="1px"
                  borderRadius="md"
                  p={2}
                >
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th><FormattedMessage id={"res_sqli_td_3"} defaultMessage={'yaruski'} /></Th>
                        <Th><FormattedMessage id={"res_sqli_td_4"} defaultMessage={'yaruski'} /></Th>
                        <Th><FormattedMessage id={"res_sqli_td_5"} defaultMessage={'yaruski'} /></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.res.results.sqli.data != '' ? (
                        data.res.results.sqli.logs.map((log, index) => (
                          <Tr key={index}>
                            <Td>{log.time}</Td>
                            <Td>{log.level}</Td>
                            <Td>{log.message}</Td>
                          </Tr>
                        ))
                      ) : <></>}
                    </Tbody>
                  </Table>
                </Box>
                <Heading ml={'2'} size={'md'} mt={'1em'} mb={'1em'}><FormattedMessage id={"res_sqli_title_2"} defaultMessage={'yaruski'} /></Heading>
                {tables ? (
                  <Stack spacing={'2em'}>
                      {tables}
                  </Stack>
                ) : (<></>)}
              </TabPanel>
              {/* XSS */}
              <TabPanel>
                <Stack spacing={'2em'}>
                  <Heading ml={'2'} size={'md'} mt={'1em'}><FormattedMessage id={"res_xss_title_1"} defaultMessage={'yaruski'}/></Heading>
                  <LogTable log={data.res.results.xss_res}/>
                  <Heading ml={'2'} size={'md'} mt={'1em'}><FormattedMessage id={"res_xss_title_2"} defaultMessage={'yaruski'}/></Heading>
                  {console.log(data.res.results.xss_res)}
                  <Box>
                    {parseMultilineLog(data.res.results.xss_res).map((log, i) => (
                      <Box key={i} mb={4}>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th><FormattedMessage id={"res_xss_td_1"} defaultMessage={'yaruski'} /></Th>
                              <Th><FormattedMessage id={"res_xss_td_2"} defaultMessage={'yaruski'} /></Th>
                              <Th><FormattedMessage id={"res_xss_td_3"} defaultMessage={'yaruski'} /></Th>
                              <Th><FormattedMessage id={"res_xss_td_4"} defaultMessage={'yaruski'} /></Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>{log.timestamp}</Td>
                              <Td>{log.module}</Td>
                              <Td>{log.type}</Td>
                              <Td>{log.message}</Td>
                            </Tr>
                            {log.details.map((detail, i) => (
                              <Tr key={i}>
                                <Td colSpan={4}>{detail}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </TabPanel>
              {/* SSRF */}
              <TabPanel>
                <LogsTable logString={data.res.results.ssrf_res}/>
              </TabPanel>
            </TabPanels>
          ) : (<>Loading..</>)}
        </Tabs>
      </Box>
      {data != '' ? (
        <Summary data={data.res.results}/>
        ) : <></>
      }
    </Stack>
  );
}

export default Results;