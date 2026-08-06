// Small helpers to reduce boilerplate across resource slices.
// Each resource slice still defines its own thunks (so custom endpoints are explicit),
// but shares the same list/current/status/error state shape and reducer wiring.

export const baseListState = {
  items: [],
  current: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// Attach standard pending/fulfilled/rejected handling for a "list" thunk
export function attachListThunk(builder, thunk) {
  builder
    .addCase(thunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.items = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
}

// Attach standard pending/fulfilled/rejected handling for a "single item" thunk
export function attachItemThunk(builder, thunk) {
  builder
    .addCase(thunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.current = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
}
