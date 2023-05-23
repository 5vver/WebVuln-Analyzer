import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const brandPrimary = defineStyle((props) => {
  const { colorScheme: c } = props
  return {
    fontFamily: "sans-serif",
    bg: "transparent",
    fontWeight: "semibold",
    color: 'white',
    transition: 'transform 0.15s ease-out, background 0.15s ease-out',
    _dark: {
      bg: "transparent",
      color: 'white',
      _active: {
        bg: `${c}.600`,
      },
      _hover: {
        bg: `${c}.700`
      }
    },

    _hover: {
      transform: "scale(1.05, 1.05)",
      bg: `${c}.600`,

      _dark: {
        bg: `${c}.300`,
      },
    },

    _active: {
      bg: `${c}.700`,
      transform: "scale(1, 1)",

      _dark: {
        bg: `${c}.400`,
      }
    },
  }
})

export const buttonTheme = defineStyleConfig({
  variants: { brandPrimary },
})