import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendanceByStudent,
  fetchAttendanceBySubject,
  fetchAttendanceByDate,
  fetchAttendancePercentage,
} from "../store/slices/attendanceSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { items, percentage, status, error } = useSelector((state) => state.attendance);

  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [pctStudentId, setPctStudentId] = useState("");
  const [pctSubjectId, setPctSubjectId] = useState("");

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Academic workspace</p><h2>Attendance</h2><p className="page-subtitle">Look up attendance records and percentages.</p></div></header>
      <StatusMessage status={status} error={error} />
      <p className="page-subtitle">
        There's no "get all attendance" endpoint on the backend, so pick a filter below.
      </p>

      <div className="panel filters"><div className="filter-group">
        <input
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button className="button" onClick={() => studentId && dispatch(fetchAttendanceByStudent(studentId))}>
          By Student
        </button>

      </div><div className="filter-group"><input
          placeholder="Subject ID"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        />
        <button className="button" onClick={() => subjectId && dispatch(fetchAttendanceBySubject(subjectId))}>
          By Subject
        </button>

      </div><div className="filter-group"><input
          placeholder="YYYY-MM-DD"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="button" onClick={() => date && dispatch(fetchAttendanceByDate(date))}>By Date</button>
      </div></div>

      <DataTable rows={items} />

      <h3 className="section-title section">Attendance Percentage</h3>
      <div className="panel filters"><div className="filter-group">
      </div><div className="filter-group"><input
          placeholder="Student ID"
          value={pctStudentId}
          onChange={(e) => setPctStudentId(e.target.value)}
        />
        <input
          placeholder="Subject ID"
          value={pctSubjectId}
          onChange={(e) => setPctSubjectId(e.target.value)}
        />
        <button className="button"
          onClick={() =>
            pctStudentId &&
            pctSubjectId &&
            dispatch(
              fetchAttendancePercentage({ studentId: pctStudentId, subjectId: pctSubjectId })
            )
          }
        >
          Get Percentage
        </button>
      </div></div>
      {percentage && <DataTable rows={[percentage]} />}
    </section>
  );
}
