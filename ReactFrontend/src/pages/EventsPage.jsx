import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, fetchUpcomingEvents } from "../store/slices/eventSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function EventsPage() {
  const dispatch = useDispatch();
  const { items, upcoming, status, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchUpcomingEvents());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Campus calendar</p><h2>Events</h2><p className="page-subtitle">Discover what is happening across campus.</p></div></header>
      <StatusMessage status={status} error={error} />

      <h4 className="section-title">Upcoming Events</h4>
      <DataTable rows={upcoming} />

      <h4 className="section-title section">All Events</h4>
      <DataTable rows={items} />
    </section>
  );
}
