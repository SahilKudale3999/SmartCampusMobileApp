import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { facultyApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`faculty/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchFaculties = thunk("fetchAll", () => facultyApi.getAll());
export const fetchFacultyById = thunk("fetchById", (id) => facultyApi.getById(id));
export const fetchFacultyByDepartment = thunk("fetchByDepartment", (department) =>
  facultyApi.getByDepartment(department)
);
export const createFaculty = thunk("create", (payload) => facultyApi.create(payload));
export const updateFaculty = thunk("update", ({ id, payload }) => facultyApi.update(id, payload));
export const deleteFaculty = thunk("delete", (id) => facultyApi.remove(id));

const facultySlice = createSlice({
  name: "faculty",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchFaculties);
    attachItemThunk(builder, fetchFacultyById);
    attachItemThunk(builder, fetchFacultyByDepartment); // backend returns single FacultyResponse here
    attachItemThunk(builder, createFaculty);
    attachItemThunk(builder, updateFaculty);
    builder.addCase(deleteFaculty.fulfilled, (state, action) => {
      state.items = state.items.filter((f) => f.facultyId !== action.meta.arg);
    });
  },
});

export default facultySlice.reducer;
