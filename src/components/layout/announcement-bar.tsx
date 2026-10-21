import { brand } from "@/config/brand";

export function AnnouncementBar() {
  const items = [...brand.announcements, ...brand.announcements];
  return (
    <div className="relative overflow-hidden bg-ink text-bone" role="region" aria-label="Announcements">
      <ul className="flex w-max items-center whitespace-nowrap py-2 motion-safe:[animation:marquee_48s_linear_infinite] motion-reduce:mx-auto motion-reduce:w-full motion-reduce:justify-center">
        {items.map((text, i) => (
          <li
            key={i}
            aria-hidden={i >= brand.announcements.length ? true : undefined}
            className={`eyebrow flex items-center gap-8 px-8 ${i > 0 ? "motion-reduce:hidden" : ""}`}
          >
            <span>{text}</span>
            <span aria-hidden className="size-1 bg-ember" />
          </li>
        ))}
      </ul>
    </div>
  );
}
