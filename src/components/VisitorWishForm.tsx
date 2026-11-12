import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { LanternShape } from "@/components/Sky";
import {
  MAX_NICK,
  EMAIL_DOMAIN,
  normalizeEmail,
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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<LanternLocation | "">("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [launchOrigin, setLaunchOrigin] = useState<{
    left: number;
    top: number;
  } | null>(null);
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
    let normalizedEmail: string;
    try {
      normalizedEmail = normalizeEmail(email);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Please enter your company email.",
      );
      return;
    }
    if (!location) {
      setError("Please select your plant.");
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
      await onSubmit({
        employee_name: name.trim(),
        email: normalizedEmail,
        message: message.trim(),
        plant: location,
      });
      if (buttonBounds) {
        setLaunchOrigin({
          left: buttonBounds.left + buttonBounds.width / 2,
          top: buttonBounds.top + buttonBounds.height / 2,
        });
      }
      setSubmitted(true);
      onSuccess();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your wish could not be saved.",
      );
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
          Your light is on its way!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for sharing your wish. Together, we make the festival
          brighter.
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
      <p className="text-sm text-muted-foreground">
        Share a little hope with your colleagues. Your name, plant and approved
        wish will appear on the festival sky. Your email is visible only to
        moderators.
      </p>
      <div>
        <label htmlFor="nick" className="text-sm font-medium text-foreground">
          Employee Name
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
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background/60 focus-within:ring-2 focus-within:ring-ring">
          <input
            id="email"
            value={email}
            type="text"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            required
            onChange={(event) => {
              const value = event.target.value;
              setEmail(
                value.toLowerCase().trim().endsWith(EMAIL_DOMAIN)
                  ? value.trim().slice(0, -EMAIL_DOMAIN.length)
                  : value,
              );
              if (error) setError(null);
            }}
            placeholder="your.name"
            aria-describedby="email-domain"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-foreground outline-none"
          />
          <span id="email-domain" className="shrink-0 pr-3 text-xs text-gold">
            {EMAIL_DOMAIN}
          </span>
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-foreground">Plant</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {OFFICE_LOCATIONS.map((office) => (
            <button
              type="button"
              key={office}
              aria-pressed={location === office}
              onClick={() => {
                setLocation(office);
                setError(null);
              }}
              className={`rounded-xl border py-3 font-bold transition ${
                location === office
                  ? "border-gold bg-primary text-gold shadow-glow"
                  : "border-gold/30 bg-background/60 text-muted-foreground hover:bg-gold/10"
              }`}
            >
              {office}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <div className="flex justify-between gap-3">
          <label htmlFor="wish" className="text-sm font-medium text-foreground">
            Your Wish Message
          </label>
          <span className="shrink-0 text-xs text-muted-foreground">
            {message.length.toLocaleString()} characters
          </span>
        </div>
        <textarea
          id="wish"
          value={message}
          rows={4}
          minLength={3}
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
