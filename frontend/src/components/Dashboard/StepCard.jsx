const cardClass = 'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

function StepCard({ step, title, children }) {
  return (
    <div className={cardClass}>
      <h2 className="flex items-center gap-3 text-base md:text-lg font-semibold text-(--text-primary) mb-5">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0D66D4] text-white text-sm font-bold shrink-0">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default StepCard;
