import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { LanternShape } from "@/components/Sky";
import {
  MAX_NICK,
  MAX_EMPLOYEE_ID,
  MAX_WISH,
  OFFICE_LOCATIONS,
  validateWish,
  type LanternLocation,
  type CreateLanternInput,
} from "@/lib/lanterns";

interface VisitorWishFormProps {
  onSubmit: (input: CreateLanternInput) => Promise<void>;
  onSuccess: () => void;
}

export function VisitorWishForm({ onSubmit, onSuccess }: VisitorWishFormProps) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<LanternLocation | "">("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [launchOrigin, setLaunchOrigin] = useState<{ left: number; top: number } | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!launchOrigin) return;
    const timer = window.setTimeout(() => setLaunchOrigin(null), 2600);
    return () => window.clearTimeout(timer);
  }, [launchOrigin]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!employeeId.trim()) {
      setError("Please enter your employee ID.");
      return;
    }
    if (!location) {
      setError("Please select your office location.");
      return;
    }
    const wishError = validateWish(message);
    if (wishError) {
      setError(wishError);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    const buttonBounds = event.currentTarget
      .querySelector<HTMLButtonElement>('button[type="submit"]')
      ?.getBoundingClientRect();
    try {
      await onSubmit({ name, employeeId, message, officeLocation: location });
      if (buttonBounds) {
        setLaunchOrigin({
          left: buttonBounds.left + buttonBounds.width / 2,
          top: buttonBounds.top + buttonBounds.height / 2,
        });
      }
      setSubmitted(true);
      onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your wish could not be saved.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const launchEffect = launchOrigin
    ? typeof document === "undefined"
      ? null
      : createPortal(
          <span
            className="wish-launch-lantern"
            style={{ left: launchOrigin.left, top: launchOrigin.top }}
            aria-hidden="true"
          >
            <LanternShape size={38} />
          </span>,
          document.body,
        )
    : null;

  if (submitted) {
    return (
      <div className="visitor-success wish-card p-6 text-center animate-in fade-in zoom-in-95">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-3 font-serif text-xl font-bold text-foreground">
          Your wish has joined the festival collection!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          It will appear on the festival sky after admin approval.
        </p>
        <Link
          to="/display"
          className="visitor-success-link inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow"
        >
          VIEW THE FESTIVAL SKY
        </Link>
        {launchEffect}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="wish-card space-y-4 p-5" noValidate>
      <div>
        <label htmlFor="nick" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="nick"
          value={name}
          maxLength={MAX_NICK}
          required
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Aye Aye"
          className="mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="employeeId" className="text-sm font-medium text-foreground">
          Employee ID
        </label>
        <input
          id="employeeId"
          value={employeeId}
          maxLength={MAX_EMPLOYEE_ID}
          required
          onChange={(event) => {
            setEmployeeId(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter your employee ID"
          className="mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="location" className="text-sm font-medium text-foreground">
          Office Location
        </label>
        <select
          id="location"
          value={location}
          required
          onChange={(event) => {
            const selected = event.target.value;
            if (OFFICE_LOCATIONS.includes(selected as LanternLocation)) {
              setLocation(selected as LanternLocation);
            } else {
              setLocation("");
            }
            if (error) setError(null);
          }}
          className="mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>
            Select your office location
          </option>
          {OFFICE_LOCATIONS.map((office) => (
            <option key={office} value={office}>
              {office}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex justify-between gap-3">
          <label htmlFor="wish" className="text-sm font-medium text-foreground">
            Your festival wish
          </label>
          <span className="shrink-0 text-xs text-muted-foreground">
            {message.length}/{MAX_WISH}
          </span>
        </div>
        <textarea
          id="wish"
          value={message}
          rows={4}
          maxLength={MAX_WISH}
          required
          onChange={(event) => {
            setMessage(event.target.value);
            if (error) setError(null);
          }}
          placeholder="May our town shine bright…"
          aria-invalid={!!error}
          className="mt-1.5 w-full resize-y rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {error && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-sans text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-60"
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        {submitting ? "SENDING YOUR WISH…" : "LIGHT MY LANTERN"}
      </button>
      {launchEffect}
    </form>
  );
}
