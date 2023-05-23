import React, { useEffect, useState } from "react";
import {
    Box,
    Badge,
    Divider,
    Heading,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    Button,
    Stack,
    useColorModeValue
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import AddToQueue from "./AddToQueue";
import QueueHelper from "./QueueHelper";

import {Link, useNavigate} from "react-router-dom";
import { FormattedMessage } from 'react-intl';

export const QueuesContext = React.createContext({
    queues: [], fetchQueues: () => {}
})

export default function Queues() {
    const navigate = useNavigate();

    const handleShowResults = (id) => {
        navigate(`/results/${id}`);
    };

    const [queues, setQueues] = useState([]);
    const fetchQueues = async () => {
        const response = await fetch("http://localhost:8000/queues");
        const queues = await response.json();
        setQueues(queues.data);
    };
    useEffect(() => {
        fetchQueues()
    }, []);

    const headingColor = useColorModeValue('blackAlpha.800', 'teal.300');

    return (
        <QueuesContext.Provider value={{queues, fetchQueues}}>
            <Heading as='h1' size='xl' align='center' noOfLines={1} color={headingColor} margin="2em 0"><FormattedMessage id={'title_1'} defaultMessage={"web-vuln analyzer"}/></Heading>
            <AddToQueue />
            <Divider orientation={'horizontal'}/>
            <Stack spacing={5} align={'center'} marginTop={'2.5em'} mb={'2em'}>
                <Heading as={"h2"} size={'lg'} color={headingColor}><FormattedMessage id={"title_4"} defaultMessage={'lolxd'}/></Heading>
                <Box
                    boxShadow="lg"
                    borderRadius="lg"
                    overflow="hidden"
                    mx="auto"
                    >
                    <Table variant='simple' colorScheme='teal' size='lg'>
                        <TableCaption><FormattedMessage id={"table_bottom_heading"} defaultMessage={"lolxd"}/></TableCaption>
                        <Thead>
                            <Tr>
                                <Th><FormattedMessage id={"table_val_1"} defaultMessage={"lolxd"}/></Th>
                                <Th><FormattedMessage id={"table_val_2"} defaultMessage={"lolxd"}/></Th>
                                <Th><FormattedMessage id={"table_val_3"} defaultMessage={"lolxd"}/></Th>
                                <Th><FormattedMessage id={"table_val_4"} defaultMessage={"lolxd"}/></Th>
                                <Th><FormattedMessage id={"table_val_5"} defaultMessage={"lolxd"}/></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {queues != '' ? (queues.map((queue, key) => (
                                  <Tr key={key}>
                                      <Td>{queue.target} <QueueHelper item={queue.data} id={queue.target}/></Td>
                                      <Td>{queue.data.url}</Td>
                                      <Td>
                                          <Box maxWidth={'20em'} overflow="hidden" textOverflow="ellipsis"
                                               whiteSpace="pre-line">{queue.data.cookies}
                                          </Box>
                                      </Td>
                                      <Td>
                                          {queue.status === 'Waiting' ? <Badge ml={'1'} colorScheme='yellow'><FormattedMessage id={"table_status_2"} defaultMessage={'lolxd'}/> </Badge> :
                                            (queue.status === 'Done' ? <Badge ml={'1'} colorScheme='green'><FormattedMessage id={"table_status_3"} defaultMessage={'lolxd'}/></Badge> :
                                                <Badge ml={'1'} colorScheme='red'><FormattedMessage id={"table_status_1"} defaultMessage={'lolxd'}/></Badge>
                                            )}
                                      </Td>
                                      <Td>
                                          {queue.status === 'Done' ? <Button ml={'25%'} variant={'ghost'} onClick={() => handleShowResults(queue.target.substr(queue.target.length - 1))}><ViewIcon/></Button> : <ViewOffIcon ml={'50%'} />}
                                      </Td>
                                  </Tr>
                                )
                              )) : (
                                    <Tr>
                                        <Td>...</Td>
                                        <Td>...</Td>
                                        <Td>...</Td>
                                        <Td>...</Td>
                                        <Td>...</Td>
                                    </Tr>
                                )}
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th><FormattedMessage id={"table_val_1"} defaultMessage={'lolxd'} /></Th>
                                <Th><FormattedMessage id={"table_val_2"} defaultMessage={'lolxd'} /></Th>
                                <Th><FormattedMessage id={"table_val_3"} defaultMessage={'lolxd'} /></Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </Box>
            </Stack>
            <Divider orientation='horizontal' />
        </QueuesContext.Provider>
    )
}
