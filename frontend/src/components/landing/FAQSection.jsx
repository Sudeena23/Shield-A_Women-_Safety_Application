import React, { useState } from 'react';
import { FAQS } from '../../utils/constants';
import { ChevronDown, HelpCircle } from 'lucide-react';

/**
 * FAQSection Component
 * Renders accordion-style expandable questions and answers.
 */
export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f7f0e6] text-[#814a27] font-extrabold text-xs uppercase tracking-wider border border-[#eee0ce]">
          <HelpCircle className="w-4 h-4 text-[#9e6133]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#2d180c] tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-[#814a27]/80 text-sm sm:text-base">
          Have questions about how Shield works? Find quick answers below.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#eee0ce] rounded-2xl overflow-hidden transition-all duration-200 shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 text-left font-extrabold text-[#2d180c] text-base flex items-center justify-between gap-4 hover:bg-[#fdfbf7] transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#814a27] transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#9e6133]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#814a27]/90 leading-relaxed border-t border-[#f7f0e6] bg-[#fdfbf7]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
