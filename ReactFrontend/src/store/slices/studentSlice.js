import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { studentApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`students/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchStudents = thunk("fetchAll", () => studentApi.getAll());
export const fetchStudentById = thunk("fetchById", (id) => studentApi.getById(id));
export const fetchStudentsByCourse = thunk("fetchByCourse", (courseId) => studentApi.getByCourse(courseId));
export const fetchStudentByRollNo = thunk("fetchByRollNo", (rollNo) => studentApi.getByRollNo(rollNo));
export const createStudent = thunk("create", (payload) => studentApi.create(payload));
export const updateStudent = thunk("update", ({ id, payload }) => studentApi.update(id, payload));
export const deleteStudent = thunk("delete", (id) => studentApi.remove(id));

const studentSlice = createSlice({
  name: "students",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchStudents);
    attachListThunk(builder, fetchStudentsByCourse);
    attachItemThunk(builder, fetchStudentById);
    attachItemThunk(builder, fetchStudentByRollNo);
    attachItemThunk(builder, createStudent);
    attachItemThunk(builder, updateStudent);
    builder.addCase(deleteStudent.fulfilled, (state, action) => {
      state.items = state.items.filter((s) => s.studentId !== action.meta.arg);
    });
  },
});

export default studentSlice.reducer;
