import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignments, fetchAssignmentsBySubject } from "../store/slices/assignmentSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function AssignmentsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.assignments);
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Academic workspace</p><h2>Assignments</h2><p className="page-subtitle">Review and filter assignment records.</p></div></header>
      <StatusMessage status={status} error={error} />

      <div className="panel filters"><div className="filter-group">
        <input
          placeholder="Subject ID"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        />
        <button className="button" onClick={() => subjectId && dispatch(fetchAssignmentsBySubject(subjectId))}>
          Filter by Subject
        </button>
      </div></div>

      <DataTable rows={items} />
    </section>
  );
}
