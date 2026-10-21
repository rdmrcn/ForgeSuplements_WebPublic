import type { Nutrition } from "@/domain/types";

export function NutritionTable({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div>
      <p className="mb-3 border border-ember/60 bg-ember/10 p-3 text-xs leading-snug">
        <strong>Illustrative demo values.</strong> This table is placeholder content for a portfolio project. It is not verified label data and must be replaced before any real sale.
      </p>
      <table className="w-full max-w-md border-collapse text-sm">
        <caption className="mb-2 text-left font-semibold">Per serving: {nutrition.servingSize}</caption>
        <tbody>
          {nutrition.rows.map((row) => (
            <tr key={row.label} className="border-t border-line-strong">
              <th scope="row" className={`py-2 text-left font-normal ${row.indent ? "pl-5 text-stone" : "font-medium"}`}>{row.label}</th>
              <td className="py-2 text-right tabular-nums">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
