import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  fetchStudentsByCourse,
  fetchStudentByRollNo,
} from "../store/slices/studentSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function StudentsPage() {
  const dispatch = useDispatch();
  const { items, current, status, error } = useSelector((state) => state.students);
  const [courseId, setCourseId] = useState("");
  const [rollNo, setRollNo] = useState("");

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">People directory</p><h2>Students</h2><p className="page-subtitle">Search student records by course or roll number.</p></div></header>
      <StatusMessage status={status} error={error} />

      <div className="panel filters"><div className="filter-group">
        <input
          placeholder="Course ID"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />
        <button className="button" onClick={() => courseId && dispatch(fetchStudentsByCourse(courseId))}>
          Filter by Course
        </button>

      </div><div className="filter-group"><input
          placeholder="Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />
        <button className="button" onClick={() => rollNo && dispatch(fetchStudentByRollNo(rollNo))}>
          Find by Roll No
        </button>
      </div></div>

      {current && (
        <div className="section">
          <h4 className="section-title">Found student</h4>
          <DataTable rows={[current]} />
        </div>
      )}

      <h4 className="section-title section">All Students</h4>
      <DataTable rows={items} />
    </section>
  );
}
