import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "./Reservations/NewReservation";
import NewTable from "./NewTable";
import Search from "./Search";
import Reservation from "./Reservations/Reservation";
import Seat from "./Seat";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [reservationId, setReservationId] = React.useState();

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} setReservationId={setReservationId} />
      </Route>
      <Route exact path="/reservations/new">
        <NewReservation />
      </Route>
      <Route exact path="/tables/new">
        <NewTable />
      </Route>
      <Route exact path='/search'>
        <Search />
      </Route>
      <Route exact path='/reservations/:reservationId'>
        <Reservation />
      </Route>
      <Route exact path="/reservations/:reservationId/seat">
        <Seat reservationId={reservationId} />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
