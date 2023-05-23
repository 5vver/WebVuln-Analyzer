import React, {useContext} from "react";
import {Heading, Flex, Select, useColorMode, useColorModeValue, Button, Text} from "@chakra-ui/react";
import { SunIcon, MoonIcon }from "@chakra-ui/icons"

import { Link } from "react-router-dom"

import {LocaleContext} from "../routes/App"

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode()

    const headerBg = useColorModeValue("linear(to-r, teal.300, blue.500)", "linear(to-r, teal.700, blue.900)")
    const headingColor = useColorModeValue("whiteAlpha.900", "teal.100")

    const {locale, setLocale} = useContext(LocaleContext);

  const handleLanguageChange = () => {
    locale === 'en' ? setLocale("ru") : setLocale("en")
  };

    return (
        <Flex
            as="nav"
            align={"center"}
            justify={"space-between"}
            wrap={"wrap"}
            padding={"0.8rem"}
            bgGradient={headerBg}>
            <Flex align={"center"} mr={5}>
                <Link to={"/"}>
                  <Heading as="h1"
                           color={headingColor}
                           size="md"
                           paddingLeft="8rem"
                           userSelect={"none"}
                  >WebVuln Analyzer</Heading>
                </Link>
            </Flex>
            <Flex align={"right"} gap={'1'}>
              <Button onClick={handleLanguageChange} size={'sm'} variant={'brandPrimary'} colorScheme={'blue'}>
                {locale === 'en' ? <Text>EN</Text> : <Text>RU</Text>}
              </Button>
              <Button onClick={toggleColorMode} size={'sm'} variant={'solid'} colorScheme="blue">
                {colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
              </Button>
            </Flex>

        </Flex>
    );
};

export default Header;