//
// fetchCurrentBookings
// ---------------------
// Fetches all ACTIVE class bookings for a specific user.
// Used to determine which classes the user has already booked.
// Returns only the schedule IDs and booking IDs so the frontend
// can quickly check booking status.
//
export async function fetchCurrentBookings(userId: string) {

  // Send GET request to backend endpoint with user_id as query param
  const res = await fetch(`http://localhost:8000/classes/my-bookings?user_id=${userId}`);

  // Parse JSON response
  const data = await res.json();

  // Backend always returns { success: boolean, message, bookings: [...] }
  // If success is false, throw error so UI can display an alert
  if (!data.success) throw new Error(data.message);

  // Return simplified list containing only fields the frontend needs
  return data.bookings.map((b: any) => ({
    schedule_id: b.schedule_id, // class schedule the user booked
    booking_id: b.id, // booking record ID
  }));
}


//
// createBooking
// ---------------------
// Attempts to book a class for a user.
// Sends a POST request with user_id and schedule_id.
// If the booking succeeds, backend returns a booking object.
// If the class is full or already booked, backend returns success=false.
//
export async function createBooking(userId: string, scheduleId: number) {
  const res = await fetch("http://localhost:8000/classes/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Body contains the required booking payload
    body: JSON.stringify({ user_id: userId, schedule_id: scheduleId }),
  });

  const data = await res.json();

  // If backend indicates failure, bubble it up to UI
  if (!data.success) throw new Error(data.message);

  // Return the created booking object (contains booking_id and schedule info)
  return data.booking;
}

//
// cancelBooking
// ---------------------
// Cancels an existing booking for a user.
// Frontend calls this when user clicks "Cancel" on a booked class.
// Sends a POST request with user_id + booking_id.
// Backend responds with the ID that was cancelled.
//
export async function cancelBooking(userId: string, bookingId: number) {
  const res = await fetch("http://localhost:8000/classes/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Body includes ID of the specific booking to cancel
    body: JSON.stringify({ user_id: userId, booking_id: bookingId }),
  });
  const data = await res.json();
  // Throw error if server rejects cancellation
  if (!data.success) throw new Error(data.message);
  // Return the cancelled booking ID
  return data.booking_id;
}
