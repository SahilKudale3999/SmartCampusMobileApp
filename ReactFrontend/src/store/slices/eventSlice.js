import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { eventApi } from "../../api";
import { baseListState, attachListThunk, attachItemThunk } from "../sliceHelpers";

const thunk = (name, fn) =>
  createAsyncThunk(`events/${name}`, async (arg, { rejectWithValue }) => {
    try {
      const res = await fn(arg);
      return res.data;
    } catch (err) {
      return rejectWithValue({ message: err.message, fieldErrors: err.fieldErrors, status: err.status });
    }
  });

export const fetchEvents = thunk("fetchAll", () => eventApi.getAll());
export const fetchUpcomingEvents = thunk("fetchUpcoming", () => eventApi.getUpcoming());
export const fetchEventById = thunk("fetchById", (id) => eventApi.getById(id));
export const createEvent = thunk("create", (payload) => eventApi.create(payload));
export const updateEvent = thunk("update", ({ id, payload }) => eventApi.update(id, payload));
export const deleteEvent = thunk("delete", (id) => eventApi.remove(id));

const initialState = {
  ...baseListState,
  upcoming: [],
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    attachListThunk(builder, fetchEvents);
    attachItemThunk(builder, fetchEventById);
    attachItemThunk(builder, createEvent);
    attachItemThunk(builder, updateEvent);
    builder
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.upcoming = action.payload;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.eventId !== action.meta.arg);
      });
  },
});

export default eventSlice.reducer;
