import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFaculties, fetchFacultyByDepartment } from "../store/slices/facultySlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function FacultyPage() {
  const dispatch = useDispatch();
  const { items, current, status, error } = useSelector((state) => state.faculty);
  const [department, setDepartment] = useState("");

  useEffect(() => {
    dispatch(fetchFaculties());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">People directory</p><h2>Faculty</h2><p className="page-subtitle">Find faculty by department or browse all records.</p></div></header>
      <StatusMessage status={status} error={error} />

      <div className="panel filters"><div className="filter-group">
        <input
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <button className="button" onClick={() => department && dispatch(fetchFacultyByDepartment(department))}>
          Filter by Department
        </button>
      </div></div>

      {current && (
        <div className="section">
          <h4 className="section-title">Filtered result</h4>
          <DataTable rows={[current]} />
        </div>
      )}

      <h4 className="section-title section">All Faculty</h4>
      <DataTable rows={items} />
    </section>
  );
}
