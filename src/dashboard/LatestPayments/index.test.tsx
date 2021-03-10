import React from 'react';
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import LatestPayments from './LatestPayments';
import api from './api';
import { createMockedFunction, examplePayments } from './testingUtil';

jest.mock('./api.ts');

const getPaymentMocked = createMockedFunction(api.getPayment);

// for some reason, with the way i restructured the first test (move the time second by second, and validate every second),
// i need to use 'jest.useFakeTimers()' without the 'modern' param,
// and also need to use a beforeEach instead of a beforeAll - not sure
// why beforeAll does not work...
beforeEach(() => {
  // we're using fake timers because we don't want to
  // wait a full second for this test to run.
  // this will make our tests more reliable
  jest.useFakeTimers();
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

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(0);

  // advance the timer by 1 second.
  // when the interval fires and the cb functions run, interally it is setting some react state.
  // this state change is happening outside of the react call stack, so react does not know when to
  // make this change happen, run any effects on re-render, and finally get the dom in a stable state.
  // since this line is the line that is making this state change happen, we will wrap it in an 'act'
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  // state changes is triggered asynchronously and therefore can happen after act finishes.
  // so will use a query that will handle async scenerios.
  // according to the docs, "findBy queries work when you expect an element to appear but the change to the DOM might not happen immediately."
  expect(await screen.findByText(firstPayment.date)).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(1);

  // advance the timer by 1 second
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(await screen.findByText(secondPayment.date)).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(2);

  // advance the timer by 1 second
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(await screen.findByText(thirdPayment.date)).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(3);
});

test('show error overlay on fetch fail', async () => {
  getPaymentMocked.mockRejectedValue(new Error('test error'));

  render(<LatestPayments />);

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(getPaymentMocked).toHaveBeenCalledTimes(0);

  // advance the timers by 1 seconds.
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(
    await screen.findByText(/Error fetching payments/i),
  ).toBeInTheDocument();
});

test('filtering payments', async () => {
  const firstPayment = examplePayments[examplePayments.length - 1];
  const secondPayment = examplePayments[examplePayments.length - 2];

  const searchQuery = firstPayment.sender.name;

  getPaymentMocked
    .mockResolvedValueOnce(firstPayment)
    .mockResolvedValueOnce(secondPayment);

  render(<LatestPayments />);

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  // both payments should be visible
  await waitFor(() => {
    expect(screen.queryByText(firstPayment.sender.name)).toBeInTheDocument();
    expect(screen.queryByText(secondPayment.sender.name)).toBeInTheDocument();
  });

  // grab the search field
  const searchField = screen.getByRole('textbox');
  fireEvent.change(searchField, { target: { value: searchQuery } });

  // the second payment will not have a field that macthes the first payment's sender name.
  // so the element will be removed from the dom..
  // we should only see the first payment
  await waitFor(() => {
    expect(screen.queryByText(firstPayment.sender.name)).toBeInTheDocument();
    expect(
      screen.queryByText(secondPayment.sender.name),
    ).not.toBeInTheDocument();
  });

  // clearning the search field should reset the table to show the two payments
  const clearIconButton = screen.getByRole('button');
  fireEvent.click(clearIconButton);

  await waitFor(() => {
    expect(screen.queryByText(firstPayment.sender.name)).toBeInTheDocument();
    expect(screen.queryByText(secondPayment.sender.name)).toBeInTheDocument();
  });
});
