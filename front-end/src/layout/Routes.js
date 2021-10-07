import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "./Reservations/NewReservation";
import NewTable from "./tables/NewTable";
import Search from "./Search";
import Reservation from "./Reservations/Reservation";
import Seat from "./tables/Seat";

import { readReservation } from "../utils/api";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [reservation_id, setReservation_id] = React.useState();
  const [reservation, setReservation] = React.useState([]);
  console.log("reservation_id in ROUTES", reservation_id)
  console.log('res in routes', reservation);

  React.useEffect(() => {
    
    async function loadReservation() {
      const res = await readReservation(reservation_id);
      setReservation(res) 
      console.log("setting res", res)
    }
    loadReservation();
  }, [])

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} setReservation_id={setReservation_id} />
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
        <Seat reservation_id={reservation_id} reservation={reservation} />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
