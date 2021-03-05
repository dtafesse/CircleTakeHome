import React, { useEffect, useState } from 'react';
import {
  Paper,
  TableContainer,
  Theme,
  makeStyles,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  TextField,
  Toolbar,
  IconButton,
  InputAdornment,
  CircularProgress,
  Grid,
} from '@material-ui/core';
import { Payment } from './types';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Error from '@material-ui/icons/Error';

const tableHeight = 450;

const useStyles = makeStyles((theme: Theme) => ({
  tableContainer: {
    height: tableHeight,
  },
  toolbarRoot: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    margin: theme.spacing(2),
  },
  title: {
    flex: '1 1 100%',
  },
  search: {
    paddingRight: theme.spacing(1),
    minWidth: 275,
    height: 50,
  },
  searchIcon: {
    paddingRight: theme.spacing(1),
  },
  overlayContainer: {
    height: tableHeight * 0.75,
    display: 'flex',
  },
}));

const TableOverlay = ({ children }: { children?: React.ReactNode }) => {
  const classes = useStyles();

  return (
    <div className={classes.overlayContainer}>
      <Grid container justify="center" alignItems="center">
        {children}
      </Grid>
    </div>
  );
};

/**
 *
 * @param value - in our case value will either be a number or a string
 * @param search
 */
const doSearch = (value: string | number, search: string) => {
  if (typeof value === 'number') {
    return value.toString().toLowerCase().includes(search.toLowerCase());
  }

  return value.toLowerCase().includes(search.toLowerCase());
};

type LatestPaymentsTableProps = {
  isLoading?: boolean;
  isError?: boolean;
  payments: Payment[];
};

export default function LatestPaymentsTable({
  isLoading,
  isError,
  payments,
}: LatestPaymentsTableProps) {
  const classes = useStyles();
  const [searchQuery, setSearchQuery] = useState('');

  // initialize filterdPayments to 'payments' prop, we will need a useEffect to capture updates to payments
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(payments);

  // this effect will run every time when at least payments or searchQuery changes...
  // this will caputure when we get an updated payments list, and if there is an active search query,
  // it should do searching on the 'updated payments' list
  useEffect(() => {
    if (searchQuery) {
      const filtered = payments.filter((payment) => {
        // if at least one of fields on payment matches search input, include the row

        // this will include the searching of all properties, including ids in the Payment type
        // i believe this was a requirment from the readme
        const shouldInclude = Object.keys(payment).some((fieldKey) => {
          const value = payment[fieldKey as keyof Payment];

          // notice payment type could have nested objects, so check if 'value' is a typeof string
          if (typeof value === 'string') {
            return doSearch(value, searchQuery);
          } else {
            return (
              doSearch(value.id, searchQuery) ||
              doSearch(value.name, searchQuery)
            );
          }
        });

        return shouldInclude;
      });

      setFilteredPayments(filtered);
    } else {
      // if search query is 'falsy' - set the incoming payments props as the new 'filteredPayments' state
      setFilteredPayments(payments);
    }
  }, [payments, searchQuery]);

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleOnSearchChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setSearchQuery(e.target.value);
  };

  const renderLoadingOverlay = () => {
    return (
      <TableOverlay>
        <CircularProgress />
      </TableOverlay>
    );
  };

  const renderErrorOverlay = () => {
    return (
      <TableOverlay>
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item xs={12}>
            <Error color="error" fontSize="large" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6"> Error fetching payments... </Typography>
          </Grid>
        </Grid>
      </TableOverlay>
    );
  };

  const renderTable = () => (
    <Table size="small" stickyHeader aria-label="latest payments table">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Sender</TableCell>
          <TableCell>Receiver</TableCell>
          <TableCell align="right">Amount</TableCell>
          <TableCell>Currency</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredPayments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.date}</TableCell>
            <TableCell>{payment.sender.name}</TableCell>
            <TableCell>{payment.receiver.name}</TableCell>
            <TableCell align="right">{payment.amount}</TableCell>
            <TableCell>{payment.currency}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Paper>
      <Toolbar className={classes.toolbarRoot}>
        <Typography className={classes.title} variant="h6" id="tableTitle">
          Latest Payments
        </Typography>
        <TextField
          className={classes.search}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className={classes.searchIcon} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search field"
                  onClick={handleSearchClear}
                  edge="end"
                  size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={searchQuery}
          onChange={handleOnSearchChange}
          placeholder="Search..."
        />
      </Toolbar>
      <TableContainer className={classes.tableContainer}>
        {isLoading
          ? renderLoadingOverlay()
          : isError
          ? renderErrorOverlay()
          : renderTable()}
      </TableContainer>
    </Paper>
  );
}
