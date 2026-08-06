import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotices } from "../store/slices/noticeSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function NoticesPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.notices);

  useEffect(() => {
    dispatch(fetchNotices());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Campus updates</p><h2>Notices</h2><p className="page-subtitle">Stay current with campus announcements.</p></div></header>
      <StatusMessage status={status} error={error} />
      <DataTable rows={items} />
    </section>
  );
}
