import {extendTheme} from '@chakra-ui/react'

import { inputTheme } from './InputTheme'
import { buttonTheme } from './ButtonTheme'

export const theme = extendTheme({
  fonts: {
    heading: `'oxanium', sans-serif`,
    body: `'Ubuntu', sans-serif`,
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    primary: "#66D897",
    secondary: "#2DBC9D",
    // "#009F9A",
    // "#04818D",
    // "#266476",
    // "#2F4858",
  },
  components: { Input: inputTheme, Button: buttonTheme }
})