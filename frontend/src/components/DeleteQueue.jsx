import React, {useContext} from "react";
import {QueuesContext} from "./Queues";

import { FormattedMessage } from 'react-intl';

import {
  Button
} from "@chakra-ui/react";

export default function DeleteQueue({id}) {
  const {fetchQueues} = useContext(QueuesContext);

  const deleteQueue = async () => {
    await fetch(`http://localhost:8000/queues/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: { "id": id }
    });
    await fetchQueues();
  }

  return (
    <Button h="1.5rem" size="sm" onClick={deleteQueue}><FormattedMessage id={"table_delete"} defaultMessage={"Delete"}/></Button>
  )
}