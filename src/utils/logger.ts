const logData = (data: unknown) => {
  if (data !== undefined) {
    console.log('Additional data was provided with this error:');
    console.error(data);
  }
};

export const logger = {
  error: (error: unknown, additionalData?: unknown) => {
    if (error instanceof Error) {
      const message = error.message;
      const stack = error.stack;

      console.error(message);
      console.error(stack);
      logData(additionalData);
      return;
    }

    if (typeof error === 'string') {
      console.error(error);
      logData(additionalData);
      return;
    }

    console.error(`Error is not an instance of Error or string! Trying to log it anyway: ${error}`);
    logData(additionalData);
  },
};
