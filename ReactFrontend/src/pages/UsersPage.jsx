import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../store/slices/userSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Administration</p><h2>Users</h2><p className="page-subtitle">Manage and review user records.</p></div></header>
      <StatusMessage status={status} error={error} />
      <DataTable rows={items} />
    </section>

    
  );
}
