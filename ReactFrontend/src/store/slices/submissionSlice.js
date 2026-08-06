import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submissionApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`submissions/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchSubmissions = thunk("fetchAll", () => submissionApi.getAll());
export const fetchSubmissionById = thunk("fetchById", (id) => submissionApi.getById(id));
export const fetchSubmissionsByAssignment = thunk("fetchByAssignment", (assignmentId) =>
  submissionApi.getByAssignment(assignmentId)
);
export const fetchSubmissionsByStudent = thunk("fetchByStudent", (studentId) =>
  submissionApi.getByStudent(studentId)
);
export const submitAssignment = thunk("create", (payload) => submissionApi.create(payload));
export const updateSubmission = thunk("update", ({ id, payload }) => submissionApi.update(id, payload));
export const deleteSubmission = thunk("delete", (id) => submissionApi.remove(id));
export const gradeSubmission = thunk("grade", ({ id, grade }) => submissionApi.grade(id, grade));

const submissionSlice = createSlice({
  name: "submissions",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchSubmissions);
    attachListThunk(builder, fetchSubmissionsByAssignment);
    attachListThunk(builder, fetchSubmissionsByStudent);
    attachItemThunk(builder, fetchSubmissionById);
    attachItemThunk(builder, submitAssignment);
    attachItemThunk(builder, updateSubmission);
    attachItemThunk(builder, gradeSubmission);
    builder.addCase(deleteSubmission.fulfilled, (state, action) => {
      state.items = state.items.filter((s) => s.submissionId !== action.meta.arg);
    });
  },
});

export default submissionSlice.reducer;
