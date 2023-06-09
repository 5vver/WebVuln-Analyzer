import React from "react";
import {
  Box,
  Flex,
  Text,
} from "@chakra-ui/react";
import DeleteQueue from './DeleteQueue'

export default function QueueHelper({item, id, fetchQueues}) {
  id = parseInt(id.slice(-1));
  return (
    <Box>
      <Flex justify="space-between">
        <Text mt={4} as="div">
          <Flex align="end">
            <DeleteQueue id={id} fetchQueues={fetchQueues}/>
          </Flex>
        </Text>
      </Flex>
    </Box>
  )
}