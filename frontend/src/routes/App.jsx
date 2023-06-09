import React, {useEffect, useState} from "react";
import {ChakraProvider} from "@chakra-ui/react";

import Header from "../components/Header";
import Queues from "../components/Queues";
import ErrorPage from "../error-page"

import { ColorModeScript } from '@chakra-ui/react'
import {theme} from "../styles/theme"
import "@fontsource/oxanium/700.css";
import "@fontsource/ubuntu";

import {Route, Routes, Navigate} from 'react-router-dom';
import Results from "./Results"

import { IntlProvider } from 'react-intl';
import Rus from "../locale/ru.json"
import Eng from "../locale/en.json"

export const LocaleContext = React.createContext({
  locale: '', setLocale: () => {}
})

function App() {

  const text = {
    'en': Eng,
    'ru': Rus
  };

  const [locale, setLocale] = useState('en');
  const userLocale = navigator.language;

  useEffect(() => Object.keys(text).forEach((key) => key === userLocale && setLocale(userLocale))  , [])

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <IntlProvider locale={locale} messages={text[locale]}>
        <ChakraProvider theme={theme}>
            <LocaleContext.Provider value={{locale, setLocale}}>
              <Header />
            </LocaleContext.Provider>
            <Routes>
              <Route path="/" element={<Queues />}/>
              <Route path="/results/:id" element={<Results />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<Navigate to="/error" replace />} />
            </Routes>
        </ChakraProvider>
    </IntlProvider>

    </>
  );
}

export default App;
