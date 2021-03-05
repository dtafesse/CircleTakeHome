import { Payment } from './types';

// this will be used during testing

export const examplePayments: Payment[] = [
  {
    id: '5830364702269435',
    date: '2021-03-04T23:41:07.000Z',
    sender: { id: 111, name: 'Muhammad Wilhite' },
    receiver: { id: 106, name: 'Mina Dionne' },
    amount: '9267.80',
    currency: 'BTC',
    memo: 'pasta and soda',
  },
  {
    id: '3322723861783743',
    date: '2021-03-04T23:41:06.000Z',
    sender: { id: 118, name: 'Immanuel Harbison' },
    receiver: { id: 103, name: 'Reece Stoker' },
    amount: '8969.32',
    currency: 'BTC',
    memo: 'pasta and tea',
  },
  {
    id: '6793791102245450',
    date: '2021-03-04T23:41:05.000Z',
    sender: { id: 101, name: 'Carl Baxter' },
    receiver: { id: 102, name: 'Macie Tomlinson' },
    amount: '1599.88',
    currency: 'EUR',
    memo: 'hamburgers and coffee',
  },
  {
    id: '709323780611157',
    date: '2021-03-04T23:41:04.000Z',
    sender: { id: 117, name: 'Margo Chaffin' },
    receiver: { id: 115, name: 'Jaxon Salisbury' },
    amount: '4339.47',
    currency: 'GBP',
    memo: 'hot dogs and orange juice',
  },
];

// callback could have any number of params of any types, and its return is also an any...
// generic function type
type Callback = (...args: any[]) => any;

/**
 * inspired from https://instil.co/blog/typescript-testing-tips-mocking-functions-with-jest/
 * 
 * during testing - we want our mocked functions to have the correct types 
 * 'jest.mock(module)' addes helper functions on the module passed in to allow us to control the return type, etc... 
 * 
 * however the typescript complier will not know about these extensions made by jest.mock.
 * so using generics we will be able to add the correct jest mocked function return types... 
 * 
 * @param fn 
 */
export function createMockedFunction<T extends Callback>(fn: T): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}