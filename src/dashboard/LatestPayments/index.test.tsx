import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LatestPayments from './index';
import api from './api';
import { createMockedFunction, examplePayments } from './testingUtil';

jest.mock('./api.ts');

const getPaymentMocked = createMockedFunction(api.getPayment);

beforeAll(() => {
  // we're using fake timers because we don't want to
  // wait a full second for this test to run.
  // this will make our tests more reliable
  jest.useFakeTimers('modern');
});
afterAll(() => {
  jest.useRealTimers();
});

test('updates latest payments every second 3 times', async () => {
  // first payment recieved from the mocked api call
  // the way example payments is defined is - the latest payment is at the front on the list...
  // these variable names could be confusing... firstPayment is really the "oldest" payment
  const firstPayment = examplePayments[examplePayments.length - 1];
  const secondPayment = examplePayments[examplePayments.length - 2];
  const thirdPayment = examplePayments[examplePayments.length - 3];

  getPaymentMocked
    .mockResolvedValueOnce(firstPayment)
    .mockResolvedValueOnce(secondPayment)
    .mockResolvedValueOnce(thirdPayment);

  render(<LatestPayments />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(0);

  // advance the timers by three seconds.
  // when the interval fires and the cb functions run, interally it is setting some react state.
  // this state change is happening outside of the react call stack, so react does not know when to
  // make this change happen, run any effects on re-render, and finally get the dom in a stable state.
  // since this line is the line that is making this state change happen, we will wrap it in an 'act'
  act(() => {
    jest.advanceTimersByTime(3000);
  });

  // state changes is triggered asynchronously and therefore can happen after act finishes.
  // so will use a query that will handle async scenerios.
  // according to the docs, "findBy queries work when you expect an element to appear but the change to the DOM might not happen immediately."
  expect(await screen.findByText(firstPayment.date)).toBeInTheDocument();
  expect(await screen.findByText(secondPayment.date)).toBeInTheDocument();
  expect(await screen.findByText(thirdPayment.date)).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(3);
});
