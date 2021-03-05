import React, { useEffect, useState } from 'react';
import api from './api';
import LatestPaymentsTable from './LatestPaymentsTable';
import { Payment } from './types';

export default function LatestPayments() {
  // getPayment fetch states
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  // history of the 25 latest payments
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // we need to make sure we do not set state on an un mounted component...
    // the fetch call could take some time, when the fetch call fullfills,
    // the component could be in an un mounted, so we do not want to call 'setState' on an unmounted component.
    // if we had routing in this application we could see this happen more frequently...
    // for example - LatestPayments mounts, we make the fetch call, but then we navigate away.
    // Then the component will now be unMounted, at this time lets say the fetch call fullfils, so when we call
    // setState, it will try to set state on an unMounted component.

    // due to how closures work, we will keep this variable within this useEffect callback,
    // so that when this component unMounts, we reset this variable back to false.
    // This flag will prevent the setting of new state after the asnyc fetch call completes.
    let currentEffectInProgress = true;

    // we will keep a local variable for the intervalID...
    // we will use to stop any ongoing intervals...
    let intervalID: NodeJS.Timeout | undefined = undefined;

    const doFetch = async () => {
      try {
        setStatus('pending');
        const latestPayment = await api.getPayment();

        if (currentEffectInProgress) {
          setStatus('success');
          // place the latest payment at the first postion...
          // makes sense to order them by the latest date...
          // also we have the requirment of only showing the first 25 latest payments
          setPayments((currPayments) =>
            [latestPayment, ...currPayments].slice(0, 25),
          );
        }
      } catch (err) {
        if (currentEffectInProgress) {
          setStatus('error');

          // if we have error, we should stop the interval
          // we could introduce some retry logic if we would go deeper in this implementation

          if (intervalID) {
            clearInterval(intervalID);
          }
        }
      }
    };

    intervalID = setInterval(doFetch, 1000);

    return () => {
      currentEffectInProgress = false;

      // during cleanup, clear the ongoing interval so we do not have a memory leak
      if (intervalID) {
        clearInterval(intervalID);
      }
    };
  }, []);

  // we can do status === 'idle' || status === 'pending' for isLoading
  // but that will make the table flash every second, not pleasing to the eyes.
  // so only load for the first time... the 'idle' state should give us this
  const isLoading = status === 'idle';
  const isError = status === 'error';

  return (
    <LatestPaymentsTable
      isLoading={isLoading}
      isError={isError}
      payments={payments}
    />
  );
}
