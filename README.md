# Client - getting started

This project was bootstrapped with Create React App](https://github.com/facebook/create-react-app).
Same prerequisites as the client for both Node and Yarn

install the client dependencies and start the react app directory by doing the following commands in the client folder:

yarn install
yarn start

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

# running test scrips

once the client dependencies have been installed, go into the client folder and run:
yarn test

# design

This react app displays payment data that is accessible via the server provided.
The get payments endpoint provides a new payment object every second. In order for the client to capture this updated payment, it calls the get payments endpoint every second at an interval. So polling implemented.

The client keeps a running history of the 25 latest payments. Every time a new payment is queried, it
places this payment at the start of the list. Therefore, the table is sorted by date in descending order.

The LatestPayments component is the container component that handles polling and updating payment objects as needed. It then passes the list of payments and the loading/error states as props to the LatestPaymentsTable.

The LatestPaymentsTable component is responsible for rendering table, and the different possible app states (loading/error). It is also allows the end user to filter the list of payments. Within this component, it holds the list of 'filtered' payments... If the search query state is empty, this 'filtered' payments list is the same list as the full payments list that gets passed in as props. If the search query state is not empty, the payments list gets filtered as needed. The nice thing about this is that this whole logic/reactivity is defined in an useEffect.

For ex: if the user searches for a specific sender's name, it will filter the payments list, but as new payments come in to this component, it will continue to filter the updated payments list and show the correct filtered payments only. So filtering still allows the user to see new payments that get queried that fit the search criteria.

# typescript

I ended up writing all of the components and tests using typescript. I really like having the type annotations, it helps catch simple bugs during refactoring.

# material-ui

I personally like the material look, so I decided to use material-ui as the framework for the pre-built in components

# state-management

I ended up just using local state to store store in these components. I did find a particular use case where i need global state, so I did not bring in redux or used React Context API
