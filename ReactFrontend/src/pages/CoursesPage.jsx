import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../store/slices/courseSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function CoursesPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Academic workspace</p><h2>Courses</h2><p className="page-subtitle">Browse the active course catalogue.</p></div></header>
      <StatusMessage status={status} error={error} />
      <DataTable rows={items} />
    </section>
  );
}
