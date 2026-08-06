import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubmissions,
  fetchSubmissionsByAssignment,
  fetchSubmissionsByStudent,
} from "../store/slices/submissionSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function SubmissionsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.submissions);
  const [assignmentId, setAssignmentId] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    dispatch(fetchSubmissions());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Academic workspace</p><h2>Submissions</h2><p className="page-subtitle">Review submissions by assignment or student.</p></div></header>
      <StatusMessage status={status} error={error} />

      <div className="panel filters"><div className="filter-group">
        <input
          placeholder="Assignment ID"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
        />
        <button className="button"
          onClick={() => assignmentId && dispatch(fetchSubmissionsByAssignment(assignmentId))}
        >
          Filter by Assignment
        </button>

      </div><div className="filter-group"><input
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button className="button" onClick={() => studentId && dispatch(fetchSubmissionsByStudent(studentId))}>
          Filter by Student
        </button>
      </div></div>

      <DataTable rows={items} />
    </section>
  );
}
