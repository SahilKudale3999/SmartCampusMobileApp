import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { attendanceApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`attendance/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchAttendanceById = thunk("fetchById", (id) => attendanceApi.getById(id));
export const fetchAttendanceByStudent = thunk("fetchByStudent", (studentId) =>
  attendanceApi.getByStudent(studentId)
);
export const fetchAttendanceBySubject = thunk("fetchBySubject", (subjectId) =>
  attendanceApi.getBySubject(subjectId)
);
export const fetchAttendanceByDate = thunk("fetchByDate", (date) => attendanceApi.getByDate(date));
export const fetchAttendancePercentage = thunk("fetchPercentage", ({ studentId, subjectId }) =>
  attendanceApi.getPercentage(studentId, subjectId)
);
export const createAttendance = thunk("create", (payload) => attendanceApi.create(payload));
export const updateAttendance = thunk("update", ({ id, payload }) => attendanceApi.update(id, payload));
export const deleteAttendance = thunk("delete", (id) => attendanceApi.remove(id));

const initialState = {
  ...baseListState,
  percentage: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchAttendanceByStudent);
    attachListThunk(builder, fetchAttendanceBySubject);
    attachListThunk(builder, fetchAttendanceByDate);
    attachItemThunk(builder, fetchAttendanceById);
    attachItemThunk(builder, createAttendance);
    attachItemThunk(builder, updateAttendance);
    builder
      .addCase(fetchAttendancePercentage.fulfilled, (state, action) => {
        state.percentage = action.payload;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.attendanceId !== action.meta.arg);
      });
  },
});

export default attendanceSlice.reducer;
