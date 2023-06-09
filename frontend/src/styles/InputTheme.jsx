import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import {
  createMultiStyleConfigHelpers
} from "@chakra-ui/styled-system"


const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

// Defining a custom variant
const variantCustom = definePartsStyle((props) => {
  const { colorScheme: c } = props
  return {
    field: {
      border: "0px solid",
      bg: "gray.50",
      _dark: {
        bg: "whiteAlpha.50"
      },

      _hover: {
        bg: "gray.200",
        _dark: {
          bg: "whiteAlpha.100"
        }
      },
      _readOnly: {
        boxShadow: "none !important",
        userSelect: "all",
      },
      _focusVisible: {
        bg: "gray.200",
        _dark: {
          bg: "whiteAlpha.100"
        }
      },
    },
  }
})

const variantOutline = definePartsStyle((props) => {
  return {
    field: {
      rounded: "Full",
      _focusVisible: {
        _dark: {
          bg: "whiteAlpha.100"
        }
      }
    },
  }
})

const variants = {
  custom: variantCustom,
  outline: variantOutline
}

export const inputTheme = defineMultiStyleConfig({
  variants
})
