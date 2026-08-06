import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubjects,
  fetchSubjectsByCourse,
  fetchSubjectsByFaculty,
} from "../store/slices/subjectSlice";
import StatusMessage from "../components/StatusMessage";
import DataTable from "../components/DataTable";

export default function SubjectsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.subjects);
  const [courseId, setCourseId] = useState("");
  const [facultyId, setFacultyId] = useState("");

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  return (
    <section className="page"><header className="page-head"><div><p className="eyebrow">Academic workspace</p><h2>Subjects</h2><p className="page-subtitle">Filter subjects by their course or faculty.</p></div></header>
      <StatusMessage status={status} error={error} />

      <div className="panel filters"><div className="filter-group">
        <input
          placeholder="Course ID"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />
        <button className="button" onClick={() => courseId && dispatch(fetchSubjectsByCourse(courseId))}>
          Filter by Course
        </button>

      </div><div className="filter-group"><input
          placeholder="Faculty ID"
          value={facultyId}
          onChange={(e) => setFacultyId(e.target.value)}
        />
        <button className="button" onClick={() => facultyId && dispatch(fetchSubjectsByFaculty(facultyId))}>
          Filter by Faculty
        </button>
      </div></div>

      <DataTable rows={items} />
    </section>
  );
}
