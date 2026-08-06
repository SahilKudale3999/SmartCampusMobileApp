import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { assignmentApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`assignments/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchAssignments = thunk("fetchAll", () => assignmentApi.getAll());
export const fetchAssignmentById = thunk("fetchById", (id) => assignmentApi.getById(id));
export const fetchAssignmentsBySubject = thunk("fetchBySubject", (subjectId) =>
  assignmentApi.getBySubject(subjectId)
);
export const createAssignment = thunk("create", (payload) => assignmentApi.create(payload));
export const updateAssignment = thunk("update", ({ id, payload }) => assignmentApi.update(id, payload));
export const deleteAssignment = thunk("delete", (id) => assignmentApi.remove(id));

const assignmentSlice = createSlice({
  name: "assignments",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchAssignments);
    attachListThunk(builder, fetchAssignmentsBySubject);
    attachItemThunk(builder, fetchAssignmentById);
    attachItemThunk(builder, createAssignment);
    attachItemThunk(builder, updateAssignment);
    builder.addCase(deleteAssignment.fulfilled, (state, action) => {
      state.items = state.items.filter((a) => a.assignmentId !== action.meta.arg);
    });
  },
});

export default assignmentSlice.reducer;
