export function AdvisorBar({
  name,
  title,
  photo,
  onContact,
}: {
  name: string;
  title: string;
  photo?: string;
  onContact: () => void;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <button
      type="button"
      onClick={onContact}
      className="dash-advisor tap press"
      aria-label={`Contact ${name}`}
    >
      {photo ? (
        <img src={photo} alt="" className="dash-advisor__photo" />
      ) : (
        <span className="dash-advisor__avatar" aria-hidden>
          {initials}
        </span>
      )}
      <span className="dash-advisor__text">
        <span className="dash-advisor__kicker">Your advisor</span>
        <span className="dash-advisor__name">{name}</span>
        <span className="dash-advisor__title">{title}</span>
      </span>
      <span className="dash-advisor__cta">Contact</span>
    </button>
  );
}
