import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { courseApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`courses/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchCourses = thunk("fetchAll", () => courseApi.getAll());
export const fetchCourseById = thunk("fetchById", (id) => courseApi.getById(id));
export const createCourse = thunk("create", (payload) => courseApi.create(payload));
export const updateCourse = thunk("update", ({ id, payload }) => courseApi.update(id, payload));
export const deleteCourse = thunk("delete", (id) => courseApi.remove(id));

const courseSlice = createSlice({
  name: "courses",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchCourses);
    attachItemThunk(builder, fetchCourseById);
    attachItemThunk(builder, createCourse);
    attachItemThunk(builder, updateCourse);
    builder.addCase(deleteCourse.fulfilled, (state, action) => {
      state.items = state.items.filter((c) => c.courseId !== action.meta.arg);
    });
  },
});

export default courseSlice.reducer;
