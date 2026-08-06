import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { noticeApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`notices/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchNotices = thunk("fetchAll", () => noticeApi.getAll());
export const fetchNoticeById = thunk("fetchById", (id) => noticeApi.getById(id));
export const createNotice = thunk("create", (payload) => noticeApi.create(payload));
export const updateNotice = thunk("update", ({ id, payload }) => noticeApi.update(id, payload));
export const deleteNotice = thunk("delete", (id) => noticeApi.remove(id));

const noticeSlice = createSlice({
  name: "notices",
  initialState: baseListState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchNotices);
    attachItemThunk(builder, fetchNoticeById);
    attachItemThunk(builder, createNotice);
    attachItemThunk(builder, updateNotice);
    builder.addCase(deleteNotice.fulfilled, (state, action) => {
      state.items = state.items.filter((n) => n.noticeId !== action.meta.arg);
    });
  },
});

export default noticeSlice.reducer;
