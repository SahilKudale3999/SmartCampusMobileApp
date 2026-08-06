import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subjectApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`subjects/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchSubjects = thunk("fetchAll", () => subjectApi.getAll());
export const fetchSubjectById = thunk("fetchById", (id) => subjectApi.getById(id));
export const fetchSubjectsByCourse = thunk("fetchByCourse", (courseId) => subjectApi.getByCourse(courseId));
export const fetchSubjectsByFaculty = thunk("fetchByFaculty", (facultyId) => subjectApi.getByFaculty(facultyId));
export const createSubject = thunk("create", (payload) => subjectApi.create(payload));
export const updateSubject = thunk("update", ({ id, payload }) => subjectApi.update(id, payload));
export const deleteSubject = thunk("delete", (id) => subjectApi.remove(id));

const subjectSlice = createSlice({
  name: "subjects",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchSubjects);
    attachListThunk(builder, fetchSubjectsByCourse);
    attachListThunk(builder, fetchSubjectsByFaculty);
    attachItemThunk(builder, fetchSubjectById);
    attachItemThunk(builder, createSubject);
    attachItemThunk(builder, updateSubject);
    builder.addCase(deleteSubject.fulfilled, (state, action) => {
      state.items = state.items.filter((s) => s.subjectId !== action.meta.arg);
    });
  },
});

export default subjectSlice.reducer;
