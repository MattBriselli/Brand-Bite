import React from "react";
import { NutritionFacts } from "@/data/articles";

interface NutritionFactsCardProps {
  itemName: string;
  nutrition: NutritionFacts;
}

export function NutritionFactsCard({ itemName, nutrition }: NutritionFactsCardProps) {
  return (
    <section
      aria-label={`Nutrition Facts for ${itemName}`}
      className="rounded-xl border-2 border-[#181512] bg-white p-5 shadow-sm max-w-sm"
    >
      <div className="border-b-8 border-[#181512] pb-2">
        <h3 className="text-2xl font-black tracking-tight text-[#181512] leading-none">
          Nutrition Facts
        </h3>
        <p className="text-xs font-semibold text-[#575049] mt-1.5">{itemName}</p>
        <div className="flex items-baseline justify-between text-xs font-bold text-[#181512] mt-2 pt-2 border-t border-[#e5dfd5]">
          <span>Serving Size</span>
          <span>{nutrition.servingSize}</span>
        </div>
      </div>

      <div className="border-b-4 border-[#181512] py-2 flex items-baseline justify-between">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#575049]">
            Amount Per Serving
          </span>
          <span className="text-2xl font-black text-[#181512]">Calories</span>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-[#181512]">{nutrition.calories}</span>
          <span className="block text-[11px] text-[#575049]">
            Calories from Fat {nutrition.caloriesFromFat}
          </span>
        </div>
      </div>

      <dl className="divide-y divide-[#e5dfd5] text-sm">
        <div className="py-1.5 flex justify-between">
          <dt className="font-bold text-[#181512]">Total Fat</dt>
          <dd className="font-semibold text-[#181512]">{nutrition.totalFat}</dd>
        </div>
        <div className="py-1.5 pl-4 flex justify-between text-xs">
          <dt className="text-[#575049]">Saturated Fat</dt>
          <dd className="font-medium text-[#181512]">{nutrition.saturatedFat}</dd>
        </div>
        <div className="py-1.5 pl-4 flex justify-between text-xs">
          <dt className="text-[#575049]">Trans Fat</dt>
          <dd className="font-medium text-[#181512]">{nutrition.transFat}</dd>
        </div>
        <div className="py-1.5 flex justify-between">
          <dt className="font-bold text-[#181512]">Cholesterol</dt>
          <dd className="font-semibold text-[#181512]">{nutrition.cholesterol}</dd>
        </div>
        <div className="py-1.5 flex justify-between">
          <dt className="font-bold text-[#181512]">Sodium</dt>
          <dd className="font-semibold text-[#181512]">{nutrition.sodium}</dd>
        </div>
        <div className="py-1.5 flex justify-between">
          <dt className="font-bold text-[#181512]">Total Carbohydrates</dt>
          <dd className="font-semibold text-[#181512]">{nutrition.totalCarbs}</dd>
        </div>
        <div className="py-1.5 pl-4 flex justify-between text-xs">
          <dt className="text-[#575049]">Dietary Fiber</dt>
          <dd className="font-medium text-[#181512]">{nutrition.dietaryFiber}</dd>
        </div>
        <div className="py-1.5 pl-4 flex justify-between text-xs">
          <dt className="text-[#575049]">Total Sugars</dt>
          <dd className="font-medium text-[#181512]">{nutrition.sugars}</dd>
        </div>
        <div className="py-1.5 flex justify-between border-b-4 border-[#181512]">
          <dt className="font-bold text-[#181512]">Protein</dt>
          <dd className="font-bold text-[#181512]">{nutrition.protein}</dd>
        </div>
      </dl>

      <p className="mt-2.5 text-[11px] leading-snug text-[#575049]">
        * Nutritional values are based on standard published chain or package data at time of review.
      </p>
    </section>
  );
}
