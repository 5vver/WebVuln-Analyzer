import React, { useEffect, useState, useContext } from 'react'
import {
    Box,
    Divider,
    Collapse,
    Button,
    Progress,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    Heading,
    Stack,
    Text,
    FormControl,
    Select,
    FormErrorMessage,
    FormHelperText,
    RadioGroup,
    Radio,
    TabList, TabPanels, Tab, TabPanel, TabIndicator,
    useColorModeValue,
    CheckboxGroup,
    Checkbox,
    Tabs,
    ScaleFade, Flex
} from "@chakra-ui/react";

import { useDisclosure } from '@chakra-ui/react'
import { LinkIcon, PlusSquareIcon } from '@chakra-ui/icons'

import {QueuesContext} from "./Queues";
import ErrorAlert from "./ErrorAlert"
import ParamDesc from "./ParamDesc"

import {FormattedMessage, useIntl} from 'react-intl';

export default function AddToQueue() {
    const {queues, fetchQueues} = useContext(QueuesContext);

    // URL
    const [url, setUrl] = useState('');
    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const handlePasteButton = async () => {
        const clipboardData = await navigator.clipboard.readText();
        setUrl(clipboardData);
    };

    // Options
    const optionsInitialValues = {
        cookies: "",
        testTo: ["sqli", "xss"]
    };
    // SQLi Options
    const optionsSqliValues = {
        verbose: 1,
        level: 1,
        risk: 1,
    };
    // SQLi Options Checkboxes
    const optionsRadioBoxes = {
        randomAgent: 0,
        skipWaf: 0,
        ignoreProxy: 0,
        ignoreRedirects: 0,
        ignoreTimeouts: 0,
        tor: 0,
        checkTor: 0,
        parseErrors: 0,
        skipStatic: 0,
        keepAlive: 0,
        hpp: 0,
        chunked: 0,
        forceSSL: 0,
        batch: 1,
        skipUrlEncode: 0,
        getAll: 0,
        skipHeuristics: 0,
        forms: 1,
        getDbs: 1,
    };
    // XSS Options
    const optionsXSS = {
        crawl: 1,
        crawlingLevel: '2',
        skipDOM: 0,
        blindXSS: 0,
        fuzzing: 0
    };
    const optionsSSRF = {
        sP: 0,
        sPVal: ''
    };
    const [options, setOptions] = useState({...optionsInitialValues, ...optionsSqliValues, ...optionsRadioBoxes,
        ...optionsXSS, ...optionsSSRF});
    const handleOptionsChange = (e) => {
        const { name, value } = e.target || e;
        setOptions({
            ...options,
            [name]: value
        });
    };
    const handleOptionsChanges = (name, values) => {
        setOptions({
            ...options,
            [name]: values,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (url) {
            let baseUrlExp = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
            let localhostExp = /^https?:\/\/(localhost|0|10|127|192(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1?\])/gi;

            let regexUrl = new RegExp(baseUrlExp);
            let regexLH = new RegExp(localhostExp);

            if (regexUrl.test(url) || regexLH.test(url)) {
                const newQueue = {
                    "target": 'target_' + (queues.length + 1),
                    "status": "Waiting",
                    "data": {
                        "url": url,
                        "cookies": options.cookies,
                        "testTo": options.testTo,
                        // sqli
                        "verbose": !!options.verbose ? options.verbose : 1,
                        "level": !!options.level ? options.level : 1,
                        "risk": !!options.risk ? options.risk : 1,
                        "randomAgent": options.randomAgent,
                        "skipWaf": options.skipWaf,
                        "ignoreProxy": options.ignoreProxy,
                        "ignoreRedirects": options.ignoreRedirects,
                        "ignoreTimeouts": options.ignoreTimeouts,
                        "tor": options.tor,
                        "checkTor": options.checkTor,
                        "parseErrors": options.parseErrors,
                        "skipStatic": options.skipStatic,
                        "keepAlive": options.keepAlive,
                        "hpp": options.hpp,
                        "chunked": options.chunked,
                        "forceSSL": options.forceSSL,
                        "batch": options.batch,
                        "skipUrlEncode": options.skipUrlEncode,
                        "getAll": options.getAll,
                        "skipHeuristics": options.skipHeuristics,
                        "forms": options.forms,
                        "getDbs": options.getDbs,
                        // xss
                        "crawl": options.crawl,
                        "crawlingLevel": !!options.crawlingLevel ? options.crawlingLevel : '2',
                        "skipDOM": options.skipDOM,
                        "blindXSS": options.blindXSS,
                        "fuzzer": options.fuzzing,
                        // ssrf
                        "sPVal": options.sP ? options.sPVal : ''
                    },
                    "results": {
                        "sqli": {
                            "log": '',
                            "data": ''
                        },
                        "xss": '',
                        "ssrf": ''
                    }
                };
                fetch("http://localhost:8000/add_to_queue", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newQueue)
                }).then(fetchQueues)
                  .finally(() => {
                      setUrl('');
                      setOptions({...options, cookies: ''});
                  });
            }
            else {
                setErrText(intl.formatMessage({ id: "error_1", defaultMessage: 'Default message' }));
                onOpenAlert();
            }
        }
        else {
            setErrText(intl.formatMessage({ id: "error_2", defaultMessage: 'Default message' }));
            onOpenAlert();
        }
    }

    const [isLoading, setIsLoading] = useState({
        buttonLoading: false,
        loaderIsIndeterminate: false,
        isLoaderVisible: 'hidden'
      }
    );

    const analyze = async (event) => {
        event.preventDefault();
        if (queues.length) {
            setIsLoading(() => ({
                // ...prevData,
                buttonLoading: true,
                loaderIsIndeterminate: true,
                isLoaderVisible: 'visible'
            }));
            try {
                const response = await fetch("http://localhost:8000/start_test");
                const results = await response.json();
            } catch (error) {
                console.error(error);
            }
            setIsLoading(() => ({
                // ...prevData,
                buttonLoading: true,
                loaderIsIndeterminate: true,
                isLoaderVisible: 'visible'
            }));
            await window.location.reload();
        }
        else {
            setErrText(intl.formatMessage({ id: "error_3", defaultMessage: 'Default message' }));
            onOpenAlert();
        }
    }

    const { isOpen, onToggle } = useDisclosure();
    const headingColor = useColorModeValue('blackAlpha.800', 'teal.300');
    const textColor = useColorModeValue('blackAlpha.700', 'white');

    // Error form
    const { isOpen: isOpenAlert, onClose: onCloseAlert, onOpen: onOpenAlert } = useDisclosure();
    const [errText, setErrText] = useState('');

    // Multiple RadioBoxes
    let radioboxes = [];
    for (let [key, value] of Object.entries(optionsRadioBoxes)) {
        radioboxes.push(
          <Flex align={'center'} key={key}>
              <Box
                borderColor="black.700"
                borderWidth="1px"
                borderRadius="md"
                p={2}
                w={"100%"}
              >
                  <RadioGroup colorScheme={'teal'} outline={''} defaultValue={`${value}`} onChange={(value) => handleOptionsChange({name: key, value: parseInt(value)})}>
                      <Text>{key}</Text>
                      <Stack spacing={2} direction={'row'}>
                          <Radio value='0'><FormattedMessage id={"radiobox_val_2"} defaultMessage={'yaruski'} /></Radio>
                          <Radio value='1'><FormattedMessage id={"radiobox_val_1"} defaultMessage={'yaruski'} /></Radio>
                      </Stack>
                  </RadioGroup>
              </Box>
              <ParamDesc pname={key} />
          </Flex>
        )
    }

    // For correct refresh of TabIndicator
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [isOpen]);

    const intl = useIntl();

    return (
        <>
            <Box
              position="fixed"
              bottom="1rem"
              right="1rem"
              zIndex="toast"
              width="100%"
              maxWidth="400px"

            >
                <ScaleFade initialScale={0.5} in={isOpenAlert}>
                    <ErrorAlert isVisible={isOpenAlert} onClose={onCloseAlert} text={errText} />
                </ScaleFade>
            </Box>
            <FormControl>
                {/* URL */}
                <Stack direction='column' p={'0 20em 0 20em'} mb={'1em'} align='center' spacing={5}>
                    <InputGroup size="lg">
                        <InputLeftAddon fontSize='1em'>
                            <LinkIcon color='black.300' />
                            <Text padding='0.2em'>URL</Text>
                        </InputLeftAddon>
                        <Input
                          width='100%'
                          name="url"
                          variant="outline"
                          type="text"
                          placeholder={intl.formatMessage({ id: 'url_1', defaultMessage: 'yaruski'})}
                          aria-label="Add a scan item"
                          onSubmit={() => false}
                          onChange={handleUrlChange}
                          value={url}
                        />
                        <Button size='s' onClick={handlePasteButton}>
                            <InputRightAddon pointerEvents='none'
                                             position='relative'
                                             color='black.300'
                                             fontSize='1em'>
                                <PlusSquareIcon />
                                <Text padding='0.2em'><FormattedMessage id={"button_1"} defaultMessage={'yaruski'} /></Text>
                            </InputRightAddon>
                        </Button>
                    </InputGroup>
                </Stack>
                <Divider orientation='horizontal' />
                {/* OPTIONS */}
                <Heading as='h2' size='lg' textAlign={'center'} m='1em' color={headingColor}><FormattedMessage id={"title_2"} defaultMessage={'yaruski'} /></Heading>
                <Stack direction='column' spacing={5} p={'0 20em 0 20em'} mb={'2em'}>
                    <Button onClick={onToggle} mx={'auto'} my={'4'}><FormattedMessage id={"button_2"} defaultMessage={'yaruski'} /></Button>
                    <Collapse in={isOpen} animateOpacity>
                        <Stack direction={'column'} spacing={2}>
                            <InputGroup size="lg" gap={'2'}>
                                <Input
                                  name="cookies"
                                  variant="outline"
                                  pr="4.5rem"
                                  type="text"
                                  value={options.cookies}
                                  color={textColor}
                                  placeholder={intl.formatMessage({ id: 'url_2', defaultMessage: 'yaruski'})}
                                  aria-label="Add a scan item"
                                  onChange={handleOptionsChange}
                                />
                            </InputGroup>
                            <Box
                              borderColor="black.700"
                              borderWidth="1px"
                              borderRadius="md"
                              p={2}>
                                <CheckboxGroup name={"testTo"} colorScheme='teal' defaultValue={["sqli", "xss"]} onChange={(values) => handleOptionsChanges("testTo", values)}>
                                    <Stack spacing={'5'} direction={'row'}>
                                        <Checkbox value="sqli"><FormattedMessage id={"checkbox_val_1"} defaultMessage={'yaruski'} /></Checkbox>
                                        <Checkbox value="xss"><FormattedMessage id={"checkbox_val_2"} defaultMessage={'yaruski'} /></Checkbox>
                                        <Checkbox value="ssrf"><FormattedMessage id={"checkbox_val_3"} defaultMessage={'yaruski'} /></Checkbox>
                                    </Stack>
                                </CheckboxGroup>
                            </Box>
                            <Box
                              borderColor="black.700"
                              borderWidth="1px"
                              borderRadius="md"
                              p={2}>
                                <Tabs position="relative" variant="unstyled" colorScheme='teal' defaultIndex={0} isLazy>
                                    <Heading size={'sm'} ml={'1em'} mt={'0.4em'}><FormattedMessage id={"options_heading_1"} defaultMessage={'yaruski'} /></Heading>
                                    <TabList>
                                        <Tab><FormattedMessage id={"options_tab_1"} defaultMessage={'yaruski'} /></Tab>
                                        <Tab><FormattedMessage id={"options_tab_2"} defaultMessage={'yaruski'} /></Tab>
                                        <Tab><FormattedMessage id={"options_tab_3"} defaultMessage={'yaruski'} /></Tab>
                                    </TabList>
                                    <TabIndicator
                                      key={refreshKey}
                                      mt="-1.5px"
                                      height="2px"
                                      bg="teal.500"
                                      borderRadius="1px"
                                    />
                                    <Divider mt={'0.5em'} orientation={'horizontal'}/>
                                    <TabPanels>
                                        <TabPanel>
                                            <Heading as='h2' size='md' textAlign={'center'} m='0.5em' color={headingColor}><FormattedMessage id={"options_heading_2"} defaultMessage={'yaruski'} /></Heading>
                                            <Stack gap={2} direction={'column'} w={"100%"}>
                                                <Flex align="center">
                                                    <Select name={'verbose'}  color={textColor} onChange={handleOptionsChange} icon={''} placeholder={intl.formatMessage({ id: "options_select_1", defaultMessage: 'yaruski'})} variant={'outline'} size={'lg'}>
                                                        <option value='0'>level 0</option>
                                                        <option value='1'>level 1</option>
                                                        <option value='2'>level 2</option>
                                                        <option value='3'>level 3</option>
                                                        <option value='4'>level 4</option>
                                                        <option value='5'>level 5</option>
                                                        <option value='6'>level 6</option>
                                                    </Select>
                                                    <ParamDesc pname={'verbose'}/>
                                                </Flex>
                                                <Flex align="center">
                                                    <Select name={'level'} color={textColor} onChange={handleOptionsChange} icon={''} placeholder={intl.formatMessage({ id: "options_select_2", defaultMessage: 'yaruski'})} variant={'outline'} size={'lg'}>
                                                        <option value='1'>level 1</option>
                                                        <option value='2'>level 2</option>
                                                        <option value='3'>level 3</option>
                                                        <option value='4'>level 4</option>
                                                        <option value='5'>level 5</option>
                                                    </Select>
                                                    <ParamDesc pname={'level'}/>
                                                </Flex>
                                                <Flex align="center">
                                                    <Select name={'risk'} color={textColor} onChange={handleOptionsChange} icon={''} placeholder={intl.formatMessage({ id: "options_select_3", defaultMessage: 'yaruski'})} variant={'outline'} size={'lg'}>
                                                        <option value='1'>risk 1</option>
                                                        <option value='2'>risk 2</option>
                                                        <option value='3'>risk 3</option>
                                                    </Select>
                                                    <ParamDesc pname={'risk'}/>
                                                </Flex>
                                                {/* CheckBoxes */}
                                                <>
                                                    {radioboxes}
                                                </>
                                            </Stack>
                                        </TabPanel>
                                        <TabPanel>
                                            <Heading as='h2' size='md' textAlign={'center'} m='0.5em' color={headingColor}><FormattedMessage id={"options_heading_3"} defaultMessage={'yaruski'} /></Heading>
                                            <Stack gap={2} direction={'column'}>
                                                <Flex align={"center"}>
                                                    <Select name={'crawlingLevel'} color={textColor} onChange={handleOptionsChange} icon={''} placeholder={intl.formatMessage({ id: "options_select_4", defaultMessage: 'yaruski'})} variant={'outline'} size={'lg'}>
                                                        <option value='1'>level 1</option>
                                                        <option value='2'>level 2</option>
                                                        <option value='3'>level 3</option>
                                                    </Select>
                                                    <ParamDesc pname={'crawlingLevel'}/>
                                                </Flex>
                                                <Flex align={"center"}>
                                                    <Box
                                                      borderColor="black.700"
                                                      borderWidth="1px"
                                                      borderRadius="md"
                                                      p={2}
                                                      w={'100%'}
                                                    >
                                                        <RadioGroup name={'crawl'} colorScheme={'teal'} outline={''} defaultValue={'1'} onChange={(val) => handleOptionsChanges('crawl', parseInt(val))}>
                                                            <Text>Crawl</Text>
                                                            <Stack spacing={2} direction={'row'}>
                                                                <Radio value='0'><FormattedMessage id={"radiobox_val_2"} defaultMessage={'yaruski'} /></Radio>
                                                                <Radio value='1'><FormattedMessage id={"radiobox_val_1"} defaultMessage={'yaruski'} /></Radio>
                                                            </Stack>
                                                        </RadioGroup>
                                                    </Box>
                                                    <ParamDesc pname={'crawl'}/>
                                                </Flex>
                                                <Flex align={"center"}>
                                                    <Box
                                                      borderColor="black.700"
                                                      borderWidth="1px"
                                                      borderRadius="md"
                                                      p={2}
                                                      w={'100%'}
                                                    >
                                                        <RadioGroup name={'skipDOM'} colorScheme={'teal'} outline={''} defaultValue={'0'} onChange={(val) => handleOptionsChanges('skipDOM', parseInt(val))}>
                                                            <Text>skipDOM</Text>
                                                            <Stack spacing={2} direction={'row'}>
                                                                <Radio value='0'><FormattedMessage id={"radiobox_val_2"} defaultMessage={'yaruski'} /></Radio>
                                                                <Radio value='1'><FormattedMessage id={"radiobox_val_1"} defaultMessage={'yaruski'} /></Radio>
                                                            </Stack>
                                                        </RadioGroup>
                                                    </Box>
                                                    <ParamDesc pname={'skipDOM'}/>
                                                </Flex>
                                                <Flex align={"center"}>
                                                    <Box
                                                      borderColor="black.700"
                                                      borderWidth="1px"
                                                      borderRadius="md"
                                                      p={2}
                                                      w={'100%'}
                                                    >
                                                        <RadioGroup name={'fuzzing'} colorScheme={'teal'} outline={''} defaultValue={'0'} onChange={(val) => handleOptionsChanges('fuzzing', parseInt(val))}>
                                                            <Text>fuzzing</Text>
                                                            <Stack spacing={2} direction={'row'}>
                                                                <Radio value='0'><FormattedMessage id={"radiobox_val_2"} defaultMessage={'yaruski'} /></Radio>
                                                                <Radio value='1'><FormattedMessage id={"radiobox_val_1"} defaultMessage={'yaruski'} /></Radio>
                                                            </Stack>
                                                        </RadioGroup>
                                                    </Box>
                                                    <ParamDesc pname={'fuzzing'}/>
                                                </Flex>
                                                <Flex align={"center"}>
                                                    <Box
                                                      borderColor="black.700"
                                                      borderWidth="1px"
                                                      borderRadius="md"
                                                      p={2}
                                                      w={'100%'}
                                                    >
                                                        <RadioGroup name={'blindXSS'} colorScheme={'teal'} outline={''} defaultValue={'0'} onChange={(val) => handleOptionsChanges('blindXSS', parseInt(val))}>
                                                            <Text>Blind XSS</Text>
                                                            <Stack spacing={2} direction={'row'}>
                                                                <Radio value='0'><FormattedMessage id={"radiobox_val_2"} defaultMessage={'yaruski'} /></Radio>
                                                                <Radio value='1'><FormattedMessage id={"radiobox_val_1"} defaultMessage={'yaruski'} /></Radio>
                                                            </Stack>
                                                        </RadioGroup>
                                                    </Box>
                                                    <ParamDesc pname={'blindXSS'}/>
                                                </Flex>
                                            </Stack>
                                        </TabPanel>
                                        <TabPanel>
                                            <Heading as='h2' size='md' textAlign={'center'} m='0.5em' color={headingColor}><FormattedMessage id={"options_heading_4"} defaultMessage={'yaruski'} /></Heading>
                                            <Flex align={"center"}>
                                                <Box
                                                  borderColor="black.700"
                                                  borderWidth="1px"
                                                  borderRadius="md"
                                                  p={2}
                                                  w={'100%'}
                                                >
                                                    <RadioGroup name={'sP'} colorScheme={'teal'} outline={''} defaultValue={'0'} onChange={(val) => handleOptionsChanges('sP', parseInt(val))}>
                                                        <Text><FormattedMessage id={"options_ssrf_text"} defaultMessage={'yaruski'} /></Text>
                                                        <Stack spacing={2} direction={'row'}>
                                                            <Radio value={'0'}><FormattedMessage id={"radiobox_val_2"} defaultMessage={'yaruski'} /></Radio>
                                                            <Radio value={'1'}><FormattedMessage id={"radiobox_val_1"} defaultMessage={'yaruski'} /></Radio>
                                                        </Stack>
                                                    </RadioGroup>
                                                </Box>
                                                <ParamDesc pname={'sP'}/>
                                            </Flex>
                                            <Collapse in={options.sP}>
                                                <InputGroup size="lg" gap={'2'} mt={'1em'}>
                                                    <Input
                                                      name="sPVal"
                                                      variant="outline"
                                                      pr="4.5rem"
                                                      type="text"
                                                      color={textColor}
                                                      placeholder={intl.formatMessage({ id: "options_select_5", defaultMessage: 'yaruski'})}
                                                      aria-label="Add a scan item"
                                                      onChange={handleOptionsChange}
                                                    />
                                                </InputGroup>
                                            </Collapse>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </Box>
                        </Stack>
                    </Collapse>
                </Stack>
                <Divider orientation='horizontal' />
                {/* Buttons */}
                <Heading as='h2' size='lg' textAlign={'center'} m='1em' color={headingColor}><FormattedMessage id={"title_3"} defaultMessage={'yaruski'} /></Heading>
                <Stack direction='column' p={'0 20em 0 20em'} align='center' spacing={5} m={'1em'}>
                    {url ? (
                      <FormHelperText>
                          <FormattedMessage id={"form_helper_1"} defaultMessage={'yaruski'} />
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage><FormattedMessage id={"form_helper_2"} defaultMessage={'yaruski'} /></FormErrorMessage>
                    )}
                    <Button size='md' type='submit' onClick={handleSubmit}><FormattedMessage id={"button_3"} defaultMessage={'yaruski'} /></Button>
                    <Button
                      name='startTest'
                      isLoading={isLoading.buttonLoading}
                      loadingText={intl.formatMessage({ id: "button_5", defaultMessage: 'yaruski'})}
                      colorScheme='teal'
                      variant='outline'
                      onClick={analyze}
                    >
                        <FormattedMessage id={"button_4"} defaultMessage={'yaruski'} />
                    </Button>
                </Stack>
                <Progress size='xs' margin={'1em'} isIndeterminate={isLoading.loaderIsIndeterminate} visibility={isLoading.isLoaderVisible} colorScheme={'green'}/>
            </FormControl>
        </>
    )
}