import React from "react";
import { FaAward, FaCrown } from "react-icons/fa";

//
// classImages
// ----------
// Maps class "type" (e.g., yoga, cardio) to the correct image file path.
// Used to dynamically set the image displayed in each class card.
//
const classImages: Record<string, string> = {
  yoga: "/images/yoga.png",
  cardio: "/images/cardio.png",
  pilates: "/images/pilates.png",
  cycling: "/images/cycling.png",
  dance: "/images/dance.png",
  strength: "/images/strength.png",
  flexibility: "/images/flexibility.png",
  combat: "/images/combat.png",
  personal: "/images/personal.png",
  barre: "/images/barre.png",
  water: "/images/water.png",
  mindfulness: "/images/mindfullness.png",
};

//
// Props used by the Card component.
// Each card displays one scheduled gym class.
//
export interface CardProps {
  className: string; // Display name of the class
  scheduledDate?: Date; // Date of the class (defaults to today)
  time: string; // Start time in HH:MM format
  duration: string; // Duration in HH:MM:SS format
  trainer: string;  // Trainer's name
  difficulty: string; // beginner / intermediate / advanced
  seatsLeft: number;  // Number of available spots remaining
  type: string; // Class category → used to pick the image
  description: string; // Class description text
  premium_status: string; // basic / premium / vip → shows badge
  isBooked: boolean; // Whether the user has already booked this class
  disabled: boolean; // If true → class is full → button disabled
  onButtonClick: () => void; // Function triggered when user clicks Book/Cancel
}

//
// Card Component
// --------------
// Displays a stylized card showing class info, image, difficulty chip,
// timing details, seats left, trainer, description, and booking button.
//
export const Card: React.FC<CardProps> = ({
  className,
  scheduledDate = new Date(),
  time,
  duration,
  trainer,
  difficulty,
  seatsLeft,
  type,
  description,
  premium_status,
  isBooked,
  disabled,
  onButtonClick,
}) => {

  //
  // Format the date nicely (e.g., "Mon, Mar 4")
  //
  const formattedDate = scheduledDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  //
  // Convert "HH:MM" → "12-hour format AM/PM"
  //
  const formattedTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  //
  // Convert duration "HH:MM:SS" → total minutes
  //
  function formattedDuration(duration: string): number {
    const [hours, minutes, _] = duration.split(":").map(Number);
    return hours * 60 + minutes;
  }

  //
  // Color of seat availability text:
  // - Gray if 0 seats left
  // - Red if 1–3 seats left
  // - Green if plenty of seats
  //
  function seatsColorClass(n: number) {
    if (n === 0) return "text-gray-500";
    if (n <= 3) return "text-rose-600";
    return "text-emerald-600";
  }

  return (
    <div className="card shadow-sm rounded-4 p-3 relative">
      {/* 
        Premium Status Badge
        ---------------------
        Shows VIP / Premium / Basic badge based on class premium_status.
        Icons:
        - VIP → Crown icon (purple)
        - Premium → Award icon (yellow)
        - Basic → Text only
      */}
      <div className="absolute top-6 right-6 flex items-center gap-1 mb-2 bg-white px-2 py-1 rounded-full shadow-lg">
        {premium_status === "vip" && (
          <>
            <FaCrown className="text-indigo-500 text-sm drop-shadow-lg" />
            <span className="text-indigo-500 font-medium text-xs">VIP</span>
          </>
        )}
        {premium_status === "premium" && (
          <>
            <FaAward className="text-yellow-400 text-sm drop-shadow-lg" />
            <span className="text-yellow-400 font-medium text-xs">Premium</span>
          </>
        )}
        {premium_status === "basic" && (
          <>
            <span className="text-gray-600 font-medium text-xs">Basic</span>
          </>
        )}
      </div>

      {/* 
        Class Image
        -----------
        Dynamically selects the correct image based on class type.
        e.g., classImages["yoga"] → "/images/yoga.png"
      */}
      <img src={classImages[type]} alt={type} className="img-fluid" />

      <div className="flex gap-2 mt-3">
        {/* 
        Difficulty Chip
        ---------------
        Shows colored tag (beginner / intermediate / advanced)
        */}
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full ${
            difficulty === "beginner"
              ? "bg-pink-100 text-pink-500"
              : difficulty === "intermediate"
              ? "bg-cyan-100 text-cyan-800"
              : difficulty === "advanced"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {difficulty}
        </span>
      </div>

      {/* Class Title */}
      <section className="d-flex flex-wrap text-left mt-2 h-9">
        <h5 className="text-xs semibold">{className}</h5>
      </section>

      {/* 
        Date / Time / Duration
        -----------------------
        Displays converted formatted date, start time, and total minutes.
      */}
      <section>
        <hr className="mt-1 mb-1 text-gray-100" />
        <span className="text-xs font-medium d-flex justify-content-center align-items-center flex-wrap">
          <i className="bi-clock me-2"></i>
          <span className="me-2">{formattedDate}</span>
          <span className="me-2">|</span>
          <span className="me-2">{formattedTime(time)}</span>
          <span className="me-2">|</span>
          <span>{formattedDuration(duration)} mins</span>
        </span>
        <hr className="mt-1 mb-2" />
      </section>

      {/* Trainer and Description Info */}
      <section className="mt-2 mb-2 text-left h-11">
        <p className="text-xs text-gray-600 h-7">{description}</p>
        <p className="mb-0 text-sm">
          <span className="font-semibold">Trainer:</span> {trainer}
        </p>
      </section>

      {/* 
        Seats Left + Action Button
        ---------------------------
        Button logic:
        - disabled = FULL (gray)
        - isBooked = CANCEL (red)
        - otherwise BOOK (green)
      */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          {!disabled && !isBooked && (
            <p className={`text-sm ${seatsColorClass(seatsLeft)} font-sm mb-0`}>
              {seatsLeft}{" "}
              <span>{seatsLeft > 1 ? "seats left" : "seat left"}</span>
            </p>
          )}
          <hr className="m-0 md-1"></hr>
        </div>
        {/* Book / Cancel / Full Button */}
        <button
          disabled={disabled}
          onClick={onButtonClick}
          className={`btn btn-sm rounded-5 px-3
            ${
              disabled
                ? "btn-secondary opacity-50 cursor-not-allowed"
                : isBooked
                ? "btn-danger"
                : "btn-success"
            }
          `}
        >
          {/* Button text changes based on state */}
          {disabled ? "FULL" : isBooked ? "CANCEL" : "BOOK"}
        </button>
      </div>
    </div>
  );
};
