import React, {useEffect} from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
} from '@chakra-ui/react';

import {useIntl} from 'react-intl';


function ErrorAlert({ isVisible, onClose, text }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const intl = useIntl();

  return isVisible ? (
    <Alert status="error" borderRadius={'md'}>
      <AlertIcon />
      <Box>
        <AlertTitle>{intl.formatMessage({ id: "table_status_1", defaultMessage: 'Default message' })}!</AlertTitle>
        <AlertDescription>{text}</AlertDescription>
      </Box>
      <CloseButton
        alignSelf='flex-start'
        position='absolute'
        right={0}
        top={0}
        onClick={onClose}
      />
    </Alert>
  ) : null;
}

export default ErrorAlert;