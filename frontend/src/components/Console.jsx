import React, { useContext, useState, useEffect } from "react";
import { Box, Code, Heading, Stack, useColorModeValue } from "@chakra-ui/react";
import useWebSocket from 'react-use-websocket';

export default function Console() {
  const [resHistory, setResHistory] = useState([]);
  const fetchRes = async () => {
    const response = await fetch("http://localhost:8000/queues")
    const results = await response.json()
    setResHistory(results)
  }
  useEffect(() => {
    fetchRes()
  }, [])

  const headingColor = useColorModeValue('blackAlpha.800', 'teal.300')

  return (
      <Box shadow={'xl'} m={'1em'}>
        <Heading as='h2' size='lg' textAlign={'center'} m='1em' color={headingColor}>Console</Heading>
        <Code colorScheme={'green'} w={'100%'} position={'flex'} p={'2em'}>
          {resHistory != '' ? (resHistory.data.map((res) => (
              <>
                <div>Target: {res.target}></div>
                <div>Status: {res.status}></div>
                <div>sqli logs: {res.results.sqli.logs}</div>
                <div>sqli data: {res.results.sqli.data}</div>
                <div>xss: {res.results.xss}</div>
                <div>ssrf: {res.results.ssrf}</div>
              </>
            ))) : (
                <div>Empty</div>
              )
          }

        </Code>
      </Box>
  )
}