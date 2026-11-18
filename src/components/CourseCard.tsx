import { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { CourseInfo, CourseTitle } from '../types/application';

interface CourseCardProps {
  course: CourseInfo;
  onSelectCourse: (courseTitle: CourseTitle) => void;
  spanWide?: boolean;
}

export default function CourseCard({
  course,
  onSelectCourse,
  spanWide = false,
}: CourseCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article
      className={`bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300 ${
        spanWide ? 'lg:col-span-2 lg:grid lg:grid-cols-12' : ''
      }`}
    >
      {course.image && (
        <div
          className={`bg-slate-100 overflow-hidden ${
            spanWide ? 'lg:col-span-5 lg:h-full aspect-[4/3] lg:aspect-auto' : 'aspect-[4/3]'
          }`}
        >
          {!imageFailed ? (
            <img
              src={course.image}
              alt={`${course.title} 실습 환경`}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col items-center justify-center p-6 text-slate-200">
              <BookOpen className="w-8 h-8 mb-2 text-blue-300" aria-hidden="true" />
              <span className="text-sm font-medium text-center">{course.title}</span>
            </div>
          )}
        </div>
      )}

      <div
        className={`p-6 sm:p-7 flex flex-col justify-between flex-1 ${
          spanWide && course.image ? 'lg:col-span-7' : ''
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
            <span className="font-mono-tabular font-semibold text-blue-700">{course.number}</span>
            <span aria-hidden="true">·</span>
            <span>{course.duration}</span>
            <span aria-hidden="true">·</span>
            <span>{course.level}</span>
            <span aria-hidden="true">·</span>
            <span>{course.format}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5">
            {course.title}
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed mb-5">{course.summary}</p>

          <div className="border-t border-slate-100 pt-4 mb-6">
            <p className="text-xs font-semibold text-slate-800 mb-2.5">주요 학습 내용</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {course.topics.map((topic, index) => (
                <li key={index} className="flex items-start gap-2.5 leading-snug">
                  <span
                    className="font-mono-tabular text-xs text-slate-400 mt-0.5 shrink-0"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onSelectCourse(course.title)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <span>수강 신청하기</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
