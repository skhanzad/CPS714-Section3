export type ClassInfo = {
  class_id: number; // Unique identifier for the class type
  class_name: string; // Human-readable name of the class (e.g., "Yoga Basics")
  created_at: Date; // Timestamp when this class type was created
  description: string; // Short description of what the class entails
  difficulty: string;  // Level of difficulty (e.g., beginner/intermediate/advanced)
  premium_status: string; // Access level: basic, premium, VIP
  type: string;  // Category of class for frontend display and images (e.g., "yoga", "cardio")
};

export type ClassSchedule = {
  class: ClassInfo, // Reference to the class type info
  id: number, // Unique ID for this scheduled session
  duration: string; // Session duration in "HH:MM:SS" format
  scheduled_date: Date; // Date of the scheduled session
  taken_spots: number; // Number of spots already booked
  time_from: string; // Start time (HH:MM)
  time_to: string; // End time (HH:MM)
  total_spots: number; // Maximum number of participants
  trainer: string; // Trainer assigned to this session
};

export async function fetchClassSchedules(
  date?: string,
  time_from?: string,
  time_to?: string
): Promise<ClassSchedule[]> {
  // Build query parameters for optional filtering
  const params = new URLSearchParams();
  if (date) params.append("date", date); // Filter by exact date
  if (time_from) params.append("time_from", time_from);  // Filter by start time
  if (time_to) params.append("time_to", time_to); // Filter by end time

  // Send GET request to backend schedules endpoint
  const res = await fetch(
    `http://localhost:8000/classes/schedules?${params.toString()}`
  );

  // If request fails, throw an error to handle in frontend
  if (!res.ok) throw new Error("Failed to fetch schedules");
  
  // Return backend JSON response, cast to correct TypeScript type
  return (await res.json()) as ClassSchedule[];
}
