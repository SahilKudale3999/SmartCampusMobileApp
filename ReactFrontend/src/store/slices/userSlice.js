import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`users/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchUsers = thunk("fetchAll", () => userApi.getAll());
export const fetchUserById = thunk("fetchById", (id) => userApi.getById(id));
export const createUser = thunk("create", (payload) => userApi.create(payload));
export const updateUser = thunk("update", ({ id, payload }) => userApi.update(id, payload));
export const deleteUser = thunk("delete", (id) => userApi.remove(id));
export const activateUser = thunk("activate", (id) => userApi.activate(id));
export const deactivateUser = thunk("deactivate", (id) => userApi.deactivate(id));

const userSlice = createSlice({
  name: "users",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchUsers);
    attachItemThunk(builder, fetchUserById);
    attachItemThunk(builder, createUser);
    attachItemThunk(builder, updateUser);
    attachItemThunk(builder, activateUser);
    attachItemThunk(builder, deactivateUser);
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.items = state.items.filter((u) => u.userId !== action.meta.arg);
    });
  },
});

export default userSlice.reducer;
