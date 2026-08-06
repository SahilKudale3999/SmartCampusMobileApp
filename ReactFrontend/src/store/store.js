import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import studentReducer from "./slices/studentSlice";
import facultyReducer from "./slices/facultySlice";
import courseReducer from "./slices/courseSlice";
import subjectReducer from "./slices/subjectSlice";
import assignmentReducer from "./slices/assignmentSlice";
import attendanceReducer from "./slices/attendanceSlice";
import submissionReducer from "./slices/submissionSlice";
import eventReducer from "./slices/eventSlice";
import noticeReducer from "./slices/noticeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    students: studentReducer,
    faculty: facultyReducer,
    courses: courseReducer,
    subjects: subjectReducer,
    assignments: assignmentReducer,
    attendance: attendanceReducer,
    submissions: submissionReducer,
    events: eventReducer,
    notices: noticeReducer,
  },
});

export default store;
